import { Router } from "express";
import {
  approveUser,
  denyUser,
  getMenteeCount,
  getMentorCount,
  getPendingUsers,
} from "../repositories/adminRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import {
  getIdParamValidationError,
  normalizeIdParam,
} from "../validation/routeValidation";

export function createAdminRouter() {
  const router = Router();

  router.get("/pending-users", requireAdmin, asyncHandler(async (_req, res) => {
    const users = await getPendingUsers();

    res.json({ users });
  }));

  router.post("/deny-user/:userId", requireAdmin, asyncHandler(async (req, res) => {
    const userId = normalizeIdParam(req.params.userId);
    const validationError = getIdParamValidationError(userId);

    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const deniedUser = await denyUser(userId);

    if (!deniedUser) {
      res.status(404).json({ message: "Pending user not found" });
      return;
    }

    res.json({ message: `${userId} has been denied` });
  }));

  router.get("/mentor-count", requireAdmin, asyncHandler(async (_req, res) => {
    const count = await getMentorCount();
    res.json(count);
  }));

  router.get("/mentee-count", requireAdmin, asyncHandler(async (_req, res) => {
    const count = await getMenteeCount();
    res.json(count);
  }));

  router.post("/approve-user/:userId", requireAdmin, asyncHandler(async (req, res) => {
    const userId = normalizeIdParam(req.params.userId);
    const validationError = getIdParamValidationError(userId);

    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const approvedUser = await approveUser(userId);

    if (!approvedUser) {
      res.status(404).json({ message: "Pending user not found" });
      return;
    }

    res.json({ message: `${userId} has been approved` });
  }));

  return router;
}
