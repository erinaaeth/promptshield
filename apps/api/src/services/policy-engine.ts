import { PolicyConfig, PolicyResult, TransactionRequest } from "@promptshield/shared";

function normalizeAddress(value: string | null | undefined): string | null {
  return value ? value.toLowerCase() : null;
}

export function evaluateRequest(request: TransactionRequest, config: PolicyConfig): PolicyResult {
  const reasons: string[] = [];
  const matchedRules: string[] = [];
  const recipient = normalizeAddress(request.recipient);

  if (!config.allowedChainsOnly.includes(request.chain)) {
    reasons.push(`Chain ${request.chain} is not allowed by wallet policy.`);
    matchedRules.push("allowedChainsOnly");
  }

  if (request.action === "transfer" && typeof request.amount === "number" && request.amount > config.maxTransferAmount) {
    reasons.push(`Transfer amount ${request.amount} exceeds maxTransferAmount of ${config.maxTransferAmount}.`);
    matchedRules.push("maxTransferAmount");
  }

  if (
    config.approvedRecipientOnly &&
    request.action === "transfer" &&
    recipient &&
    !config.approvedRecipients.includes(recipient)
  ) {
    reasons.push("Recipient is not present in the approved recipient allowlist.");
    matchedRules.push("approvedRecipientOnly");
  }

  if (
    config.blockUnlimitedApproval &&
    request.action === "approve" &&
    request.amount === Number.MAX_SAFE_INTEGER
  ) {
    reasons.push("Unlimited token approvals are blocked.");
    matchedRules.push("blockUnlimitedApproval");
  }

  if (
    config.blockUnknownContract &&
    (request.contractType === "unknown" || (request.action === "swap" && request.contractType !== "router"))
  ) {
    reasons.push("Unknown or untrusted contract type is blocked.");
    matchedRules.push("blockUnknownContract");
  }

  if (
    typeof request.amount === "number" &&
    config.dailyLimit !== null &&
    request.amount > config.dailyLimit
  ) {
    reasons.push(`Amount ${request.amount} exceeds configured daily limit of ${config.dailyLimit}.`);
    matchedRules.push("dailyLimit");
  }

  if (request.action === "unknown") {
    reasons.push("Unknown actions are denied until classified.");
    matchedRules.push("unknownAction");
  }

  const allowed = reasons.length === 0;
  const severity: PolicyResult["severity"] =
    !allowed && matchedRules.some((rule) => ["blockUnlimitedApproval", "dailyLimit", "maxTransferAmount"].includes(rule))
      ? "high"
      : !allowed
        ? "medium"
        : request.riskLevel;

  return {
    allowed,
    reasons: allowed ? ["Request satisfies current wallet security policies."] : reasons,
    severity,
    matchedRules: allowed ? ["pass"] : matchedRules
  };
}
