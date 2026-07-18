import type { ErrorRequestHandler } from "express";
import { logError } from "../services/logger";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  logError("request.unhandled_error", error, {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
  });

  if (res.headersSent) {
    return;
  }

  res.status(500).json({ message: "Internal server error" });
};
