import { TransactionRequest } from "@promptshield/shared";
import { isEthereumAddress } from "../lib/addresses";

const defaultAddress = "0x1111111111111111111111111111111111111111";

function extractAddress(prompt: string): string | null {
  const match = prompt.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

function extractAmount(prompt: string): number | null {
  const amountMatch = prompt.match(/(\d+(?:\.\d+)?)/);
  return amountMatch ? Number(amountMatch[1]) : null;
}

function inferToken(prompt: string): string {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("usdc")) {
    return "USDC";
  }

  if (normalized.includes("eth")) {
    return "ETH";
  }

  return "USDC";
}

export function interpretPrompt(prompt: string): TransactionRequest {
  const normalized = prompt.toLowerCase();
  const detectedAddress = extractAddress(prompt);
  const amount = extractAmount(prompt);

  if (normalized.includes("sign")) {
    return {
      action: "sign_message",
      chain: "eip155:1",
      token: "NONE",
      amount: null,
      recipient: null,
      contractType: "signature",
      riskLevel: "low",
      message: "PromptShield safe login message",
      metadata: {
        promptCategory: "safe",
        rawPrompt: prompt,
        interpretedAt: new Date().toISOString()
      }
    };
  }

  if (normalized.includes("approve")) {
    const unlimited = normalized.includes("unlimited") || normalized.includes("max");

    return {
      action: "approve",
      chain: "eip155:1",
      token: inferToken(prompt),
      amount: unlimited ? Number.MAX_SAFE_INTEGER : amount ?? 0,
      recipient: detectedAddress,
      spender: detectedAddress,
      contractType: "erc20",
      riskLevel: unlimited ? "high" : "medium",
      metadata: {
        promptCategory: unlimited ? "attack" : "unknown",
        rawPrompt: prompt,
        interpretedAt: new Date().toISOString()
      }
    };
  }

  if (normalized.includes("swap")) {
    return {
      action: "swap",
      chain: "eip155:1",
      token: inferToken(prompt),
      amount: amount ?? 1000,
      recipient: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      contractType: normalized.includes("router") ? "router" : "unknown",
      riskLevel: (amount ?? 1000) > 100 ? "high" : "medium",
      metadata: {
        promptCategory: (amount ?? 1000) > 100 ? "attack" : "unknown",
        rawPrompt: prompt,
        interpretedAt: new Date().toISOString()
      }
    };
  }

  if (normalized.includes("send") || normalized.includes("transfer")) {
    const sendAll = normalized.includes("all funds") || normalized.includes("everything");
    const recipient = detectedAddress ?? defaultAddress;
    const inferredAmount = sendAll ? 250 : amount ?? 5;

    return {
      action: "transfer",
      chain: "eip155:1",
      token: inferToken(prompt),
      amount: inferredAmount,
      recipient: isEthereumAddress(recipient) ? recipient : defaultAddress,
      contractType: "erc20",
      riskLevel: sendAll || inferredAmount > 50 ? "high" : "low",
      metadata: {
        promptCategory:
          sendAll || (detectedAddress !== null && recipient.toLowerCase() !== defaultAddress.toLowerCase())
            ? "attack"
            : "safe",
        rawPrompt: prompt,
        interpretedAt: new Date().toISOString()
      }
    };
  }

  return {
    action: "unknown",
    chain: "eip155:1",
    token: "UNKNOWN",
    amount: null,
    recipient: null,
    contractType: "unknown",
    riskLevel: "medium",
    metadata: {
      promptCategory: "unknown",
      rawPrompt: prompt,
      interpretedAt: new Date().toISOString()
    }
  };
}
