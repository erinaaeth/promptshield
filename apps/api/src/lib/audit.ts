import { AuditLogEntry } from "@promptshield/shared";

export function createAuditEntry(
  step: AuditLogEntry["step"],
  title: string,
  detail: string
): AuditLogEntry {
  return {
    id: `${step}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    step,
    title,
    detail,
    timestamp: new Date().toISOString()
  };
}
