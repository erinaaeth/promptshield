import { SimulationResponse } from "@promptshield/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function safeJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Unknown API error" }));
    throw new Error(body.error ?? "Unknown API error");
  }

  return response.json() as Promise<T>;
}

export async function simulatePrompt(prompt: string): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/simulate-prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt }),
    cache: "no-store"
  });

  return safeJson<SimulationResponse>(response);
}
