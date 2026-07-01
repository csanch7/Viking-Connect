import { NextFunction } from "express";

export function requireAuth(req:  any, res: any, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  next();
}

export function requireAdmin(req:  any, res: any, next: NextFunction) {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}

