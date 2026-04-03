import { ExecutionResult, TransactionRequest, WalletContext } from "@promptshield/shared";
import { env } from "../../config/env";
import { WalletAdapter } from "./types";

export class MockOwsWalletAdapter implements WalletAdapter {
  async getWalletContext(): Promise<WalletContext> {
    return {
      mode: "mock",
      walletName: env.walletName,
      walletAddress: "0xF00DBABE00000000000000000000000000000001",
      chain: env.walletChain,
      agentTokenConfigured: Boolean(env.agentToken)
    };
  }

  async executeTransaction(request: TransactionRequest): Promise<ExecutionResult> {
    const hashSeed = Buffer.from(`${request.action}-${Date.now()}`).toString("hex").slice(0, 64);

    return {
      attempted: true,
      success: true,
      mode: "mock",
      summary: `Mock wallet approved ${request.action} request in sandbox mode.`,
      txHash: `0x${hashSeed.padEnd(64, "0")}`,
      explorerUrl: "https://etherscan.io/"
    };
  }
}
