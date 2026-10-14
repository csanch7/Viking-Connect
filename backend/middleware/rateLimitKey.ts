import type { Request } from "express";
import { ipKeyGenerator } from "express-rate-limit";

export function getApiRateLimitKey(req: Request): string {
  if (req.session.userId) {
    return `user:${req.session.userId}`;
  }

  return `ip:${ipKeyGenerator(req.ip ?? "")}`;
}

export function getApiRateLimitLimit(req: Request): number {
  return req.session.userId ? 100 : 500;
}

export function getAuthRateLimitKey(req: Request): string {
  const ipKey = ipKeyGenerator(req.ip ?? "");
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  return email ? `ip-email:${ipKey}:${email}` : `ip:${ipKey}`;
}

export function getContactRateLimitKey(req: Request): string {
  const ipKey = ipKeyGenerator(req.ip ?? "");
  const sender =
    typeof req.body?.sender === "string"
      ? req.body.sender.trim().toLowerCase()
      : "";

  return sender ? `ip-sender:${ipKey}:${sender}` : `ip:${ipKey}`;
}
