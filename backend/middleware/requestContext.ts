import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { log } from "../services/logger";

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = req.header("x-request-id")?.trim() || randomUUID();
  const startedAt = performance.now();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    log("info", "request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
    });
  });

  next();
}
