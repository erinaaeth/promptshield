import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { evaluateRequest } from "../services/policy-engine";
import { interpretPrompt } from "../services/prompt-interpreter";
import { executeApprovedRequest, simulatePrompt } from "../services/simulation-service";

const promptSchema = z.object({
  prompt: z.string().min(1)
});

const requestSchema = z.object({
  action: z.enum(["transfer", "approve", "swap", "sign_message", "unknown"]),
  chain: z.string(),
  token: z.string(),
  amount: z.number().nullable(),
  recipient: z.string().nullable(),
  contractType: z.enum(["erc20", "router", "signature", "unknown"]),
  riskLevel: z.enum(["low", "medium", "high"]),
  message: z.string().optional(),
  spender: z.string().nullable().optional(),
  metadata: z.object({
    promptCategory: z.enum(["attack", "safe", "unknown"]),
    rawPrompt: z.string(),
    interpretedAt: z.string()
  })
});

export const simulationRouter = Router();

simulationRouter.post("/simulate-prompt", async (req, res, next) => {
  try {
    const { prompt } = promptSchema.parse(req.body);
    const response = await simulatePrompt(prompt);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

simulationRouter.post("/evaluate-request", (req, res, next) => {
  try {
    const request = requestSchema.parse(req.body);
    const policy = evaluateRequest(request, env.policy);
    res.json({ request, policy });
  } catch (error) {
    next(error);
  }
});

simulationRouter.post("/execute-request", async (req, res, next) => {
  try {
    const request = requestSchema.parse(req.body);
    const result = await executeApprovedRequest(request);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

simulationRouter.post("/interpret-prompt", (req, res, next) => {
  try {
    const { prompt } = promptSchema.parse(req.body);
    const request = interpretPrompt(prompt);
    res.json({ prompt, request });
  } catch (error) {
    next(error);
  }
});
