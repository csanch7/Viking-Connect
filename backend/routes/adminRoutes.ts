import { Router } from "express";
import {
  approveUser,
  deleteUser,
  denyUser,
  getMenteeCount,
  getMentorCount,
  getPendingUsers,
} from "../repositories/adminRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import { sendRegistrationAcceptanceEmail } from "../services/registrationNotificationService";
import {
  getIdParamValidationError,
  normalizeIdParam,
} from "../validation/routeValidation";

export interface AdminRouterDependencies {
  approveUser: typeof approveUser;
  deleteUser: typeof deleteUser;
  denyUser: typeof denyUser;
  getMenteeCount: typeof getMenteeCount;
  getMentorCount: typeof getMentorCount;
  getPendingUsers: typeof getPendingUsers;
  sendRegistrationAcceptanceEmail: typeof sendRegistrationAcceptanceEmail;
}

const defaultDependencies: AdminRouterDependencies = {
  approveUser,
  deleteUser,
  denyUser,
  getMenteeCount,
  getMentorCount,
  getPendingUsers,
  sendRegistrationAcceptanceEmail
};

export function createAdminRouter(
  dependencies: AdminRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const {
    approveUser,
    deleteUser,
    denyUser,
    getMenteeCount,
    getMentorCount,
    getPendingUsers,
  } = dependencies;

  router.get(
    "/pending-users",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const users = await getPendingUsers();

      res.json({ users });
    }),
  );

  router.post(
    "/deny-user/:userId",
    requireAdmin,
    asyncHandler(async (req, res) => {
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
    }),
  );

  router.get(
    "/mentor-count",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const count = await getMentorCount();
      res.json(count);
    }),
  );

  router.get(
    "/mentee-count",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const count = await getMenteeCount();
      res.json(count);
    }),
  );

  router.post(
    "/approve-user/:userId",
    requireAdmin,
    asyncHandler(async (req, res) => {
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

      await dependencies.sendRegistrationAcceptanceEmail(
        approvedUser.email
      )

      res.json({ message: `${userId} has been approved` });
    }),
  );

  router.delete(
    "/users/:userId",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const userId = normalizeIdParam(req.params.userId);
      const validationError = getIdParamValidationError(userId);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      if (userId === req.session.userId) {
        res.status(400).json({ message: "You cannot delete your own account" });
        return;
      }

      const deletedUser = await deleteUser(userId);

      if (!deletedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ message: `${deletedUser.name} has been deleted` });
    }),
  );

  return router;
}
