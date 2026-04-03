import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { simulationRouter } from "./routes/simulation";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "PromptShield API",
    description: "AI Jailbreak Tester for OWS Wallets",
    docs: ["/api/health", "/api/simulate-prompt", "/api/evaluate-request", "/api/execute-request"]
  });
});

app.use("/api/health", healthRouter);
app.use("/api", simulationRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(400).json({
    error: message
  });
});

app.listen(env.port, () => {
  console.log(`PromptShield API listening on http://localhost:${env.port}`);
});
