import { SimulationResponse, TransactionRequest } from "@promptshield/shared";
import { env } from "../config/env";
import { createAuditEntry } from "../lib/audit";
import { createWalletAdapter } from "./ows";
import { evaluateRequest } from "./policy-engine";
import { interpretPrompt } from "./prompt-interpreter";

const walletAdapter = createWalletAdapter();

export async function simulatePrompt(prompt: string): Promise<SimulationResponse> {
  const auditLog = [
    createAuditEntry("prompt_received", "Prompt Received", prompt)
  ];

  const request = interpretPrompt(prompt);
  auditLog.push(
    createAuditEntry(
      "prompt_interpreted",
      "AI Interpreted Prompt",
      `Generated ${request.action} request on ${request.chain}.`
    )
  );

  const policy = evaluateRequest(request, env.policy);
  auditLog.push(
    createAuditEntry(
      "policy_evaluated",
      "Policy Evaluated",
      policy.allowed ? "Request passed wallet policy." : policy.reasons.join(" ")
    )
  );

  const wallet = await walletAdapter.getWalletContext();

  if (!policy.allowed) {
    auditLog.push(
      createAuditEntry("request_blocked", "Request Blocked", "Firewall denied the request before execution."),
      createAuditEntry("execution_denied", "Execution Denied", "Wallet execution was not attempted.")
    );

    return {
      prompt,
      request,
      policy,
      wallet,
      execution: {
        attempted: false,
        success: false,
        mode: wallet.mode,
        summary: "Execution skipped because the policy engine denied the request.",
        txHash: null,
        explorerUrl: null
      },
      auditLog
    };
  }

  auditLog.push(createAuditEntry("request_approved", "Request Approved", "Firewall allowed execution."));
  auditLog.push(createAuditEntry("execution_attempted", "Execution Attempted", "Submitting request to wallet adapter."));

  try {
    const execution = await walletAdapter.executeTransaction(request);
    auditLog.push(createAuditEntry("execution_succeeded", "Execution Succeeded", execution.summary));

    return {
      prompt,
      request,
      policy,
      wallet,
      execution,
      auditLog
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown wallet execution error";
    auditLog.push(createAuditEntry("execution_failed", "Execution Failed", message));

    return {
      prompt,
      request,
      policy,
      wallet,
      execution: {
        attempted: true,
        success: false,
        mode: wallet.mode,
        summary: message,
        txHash: null,
        explorerUrl: null
      },
      auditLog
    };
  }
}

export async function executeApprovedRequest(request: TransactionRequest) {
  const policy = evaluateRequest(request, env.policy);
  const wallet = await walletAdapter.getWalletContext();

  if (!policy.allowed) {
    return {
      policy,
      wallet,
      execution: {
        attempted: false,
        success: false,
        mode: wallet.mode,
        summary: "Request blocked before wallet execution.",
        txHash: null,
        explorerUrl: null
      }
    };
  }

  const execution = await walletAdapter.executeTransaction(request);
  return { policy, wallet, execution };
}
