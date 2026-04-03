import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../../../.env")
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

dotenv.config();

const approvedRecipients = process.env.PROMPTSHIELD_APPROVED_RECIPIENTS
  ? process.env.PROMPTSHIELD_APPROVED_RECIPIENTS.split(",").map((value) => value.trim().toLowerCase())
  : [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222"
    ];

const allowedChains = process.env.PROMPTSHIELD_ALLOWED_CHAINS
  ? process.env.PROMPTSHIELD_ALLOWED_CHAINS.split(",").map((value) => value.trim())
  : ["eip155:1", "eip155:8453"];

export const env = {
  port: Number(process.env.PROMPTSHIELD_API_PORT ?? 4000),
  owsMode: process.env.PROMPTSHIELD_OWS_MODE === "real" ? "real" : "mock",
  walletName: process.env.PROMPTSHIELD_OWS_WALLET_NAME ?? "my-agent",
  walletChain: "eip155:1",
  agentTokenName: process.env.PROMPTSHIELD_OWS_AGENT_TOKEN_NAME ?? "my-agent-token",
  agentToken: process.env.PROMPTSHIELD_OWS_AGENT_TOKEN ?? "",
  policy: {
    maxTransferAmount: Number(process.env.PROMPTSHIELD_MAX_TRANSFER_AMOUNT ?? 50),
    approvedRecipientOnly: true,
    blockUnlimitedApproval: true,
    blockUnknownContract: true,
    allowedChainsOnly: allowedChains,
    dailyLimit: Number(process.env.PROMPTSHIELD_DAILY_LIMIT ?? 100),
    approvedRecipients
  }
} as const;
