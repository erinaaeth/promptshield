export type RiskLevel = "low" | "medium" | "high";

export type PromptAction =
  | "transfer"
  | "approve"
  | "swap"
  | "sign_message"
  | "unknown";

export interface TransactionRequest {
  action: PromptAction;
  chain: string;
  token: string;
  amount: number | null;
  recipient: string | null;
  contractType: "erc20" | "router" | "signature" | "unknown";
  riskLevel: RiskLevel;
  message?: string;
  spender?: string | null;
  metadata: {
    promptCategory: "attack" | "safe" | "unknown";
    rawPrompt: string;
    interpretedAt: string;
  };
}

export interface PolicyResult {
  allowed: boolean;
  reasons: string[];
  severity: RiskLevel;
  matchedRules: string[];
}

export interface AuditLogEntry {
  id: string;
  step:
    | "prompt_received"
    | "prompt_interpreted"
    | "policy_evaluated"
    | "request_blocked"
    | "request_approved"
    | "execution_attempted"
    | "execution_succeeded"
    | "execution_denied"
    | "execution_failed";
  title: string;
  detail: string;
  timestamp: string;
}

export interface WalletContext {
  mode: "mock" | "real";
  walletName: string;
  walletAddress: string;
  chain: string;
  agentTokenConfigured: boolean;
}

export interface ExecutionResult {
  attempted: boolean;
  success: boolean;
  mode: "mock" | "real";
  summary: string;
  txHash: string | null;
  explorerUrl: string | null;
}

export interface SimulationResponse {
  prompt: string;
  request: TransactionRequest;
  policy: PolicyResult;
  wallet: WalletContext;
  execution: ExecutionResult;
  auditLog: AuditLogEntry[];
}

export interface PolicyConfig {
  maxTransferAmount: number;
  approvedRecipientOnly: boolean;
  blockUnlimitedApproval: boolean;
  blockUnknownContract: boolean;
  allowedChainsOnly: string[];
  dailyLimit: number | null;
  approvedRecipients: string[];
}

export interface DemoPrompt {
  label: string;
  prompt: string;
  intent: "attack" | "safe";
}
