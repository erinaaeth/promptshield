import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ExecutionResult, TransactionRequest, WalletContext } from "@promptshield/shared";
import { env } from "../../config/env";
import { WalletAdapter } from "./types";

const execFileAsync = promisify(execFile);

export class RealOwsWalletAdapter implements WalletAdapter {
  async getWalletContext(): Promise<WalletContext> {
    const address = await this.lookupWalletAddress();

    return {
      mode: "real",
      walletName: env.walletName,
      walletAddress: address,
      chain: env.walletChain,
      agentTokenConfigured: Boolean(env.agentToken)
    };
  }

  async executeTransaction(request: TransactionRequest): Promise<ExecutionResult> {
    if (!env.agentToken) {
      throw new Error("PROMPTSHIELD_OWS_AGENT_TOKEN is required in real mode.");
    }

    const payload = JSON.stringify(request);

    /*
      This is the OWS execution handoff point.
      Replace the command below with the exact wallet signing or execution command
      available in your local OWS CLI or SDK version.

      The app architecture intentionally ensures:
      - the AI layer never sees the private key
      - policy checks happen before this call
      - only the delegated wallet adapter can submit the request
    */
    const { stdout } = await execFileAsync("ows", [
      "wallet",
      "sign",
      "--chain",
      request.chain,
      "--wallet",
      env.walletName,
      "--token",
      env.agentToken,
      "--payload",
      payload
    ]);

    return {
      attempted: true,
      success: true,
      mode: "real",
      summary: stdout.trim() || "OWS wallet signed and submitted the request.",
      txHash: this.extractTxHash(stdout),
      explorerUrl: "https://etherscan.io/"
    };
  }

  private async lookupWalletAddress(): Promise<string> {
    const { stdout } = await execFileAsync("ows", [
      "wallet",
      "address",
      "--chain",
      env.walletChain
    ]);

    const addressMatch = stdout.match(/0x[a-fA-F0-9]{40}/);

    if (!addressMatch) {
      throw new Error("Could not determine wallet address from OWS CLI output.");
    }

    return addressMatch[0];
  }

  private extractTxHash(output: string): string | null {
    const txMatch = output.match(/0x[a-fA-F0-9]{64}/);
    return txMatch ? txMatch[0] : null;
  }
}
