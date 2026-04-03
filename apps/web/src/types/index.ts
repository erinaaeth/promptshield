// Transaction types
export type RiskLevel = "critical" | "high" | "medium" | "low";
export type VerdictStatus = "blocked" | "allowed";
export type ChainType = "ethereum" | "polygon" | "arbitrum" | "base" | "optimism";
export type TokenType = "ETH" | "USDC" | "USDT" | "WBTC" | "DAI" | string;
export type ContractType = "ERC-20" | "ERC-721" | "DEX" | "Bridge" | "Unknown";

export interface Transaction {
  action: string;
  chain: ChainType;
  token: TokenType;
  amount: string;
  recipient: string;
  contractType: ContractType;
  riskLevel: RiskLevel;
  calldata?: string;
  gasEstimate?: string;
  nonce?: number;
}

export interface ViolatedRule {
  id: string;
  name: string;
  description: string;
  severity: RiskLevel;
}

export interface FirewallVerdict {
  status: VerdictStatus;
  severity: RiskLevel;
  reasons: string[];
  violatedRules: ViolatedRule[];
  executionTime: number; // ms
  policyVersion: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  step: number;
  type: "prompt_received" | "ai_interpreted" | "policy_evaluated" | "execution_decision" | "audit_complete";
  label: string;
  detail: string;
  status: "info" | "warning" | "blocked" | "allowed";
}

export interface DemoScenario {
  id: string;
  label: string;
  category: "attack" | "safe";
  prompt: string;
  transaction: Transaction;
  verdict: FirewallVerdict;
  auditLog: AuditEvent[];
}

export interface CustomSimulationInput {
  action: "transfer" | "approve";
  network: "ethereum" | "arbitrum" | "polygon";
  token: "USDC" | "ETH" | "DAI";
  amount: string;
  recipient: string;
}
