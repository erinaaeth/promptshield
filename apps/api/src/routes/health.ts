import { Router } from "express";
import { env } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "promptshield-api",
    mode: env.owsMode,
    timestamp: new Date().toISOString()
  });
});
