import { ExecutionResult, TransactionRequest, WalletContext } from "@promptshield/shared";

export interface WalletAdapter {
  getWalletContext(): Promise<WalletContext>;
  executeTransaction(request: TransactionRequest): Promise<ExecutionResult>;
}
