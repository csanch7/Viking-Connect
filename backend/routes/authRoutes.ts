import { Router, type RequestHandler } from "express";
import { findUserByEmail, findUserById } from "../repositories/userRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { verifyPassword } from "../services/passwordService";
import {
  getLoginValidationError,
  normalizeLoginCredentials,
} from "../validation/authValidation";

export interface AuthRouterDependencies {
  findUserByEmail: typeof findUserByEmail;
  findUserById: typeof findUserById;
  verifyPassword: typeof verifyPassword;
}

const defaultDependencies: AuthRouterDependencies = {
  findUserByEmail,
  findUserById,
  verifyPassword,
};

export function createAuthRouter(
  authLimiter: RequestHandler,
  dependencies: AuthRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const { findUserByEmail, findUserById, verifyPassword } = dependencies;

  router.post(
    "/login",
    authLimiter,
    asyncHandler(async (req, res) => {
      const { email, password } = normalizeLoginCredentials(req.body);
      const validationError = getLoginValidationError({ email, password });

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const user = await findUserByEmail(email);

      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const validPassword = await verifyPassword(user.passwordHash, password);

      if (!validPassword) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      if (user.status === "pending") {
        res.status(403).json({ message: "Account pending approval" });
        return;
      }

      if (user.status === "denied") {
        res.status(403).json({ message: "Account was not approved" });
        return;
      }

      if (user.status !== "approved") {
        res.status(403).json({ message: "Account is not approved" });
        return;
      }

      req.session.userId = user.id;
      req.session.role = user.role;
      res.json({
        message: "Logged in",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          type: user.type,
        },
      });
    }),
  );

  router.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  router.get("/session", (req, res) => {
    res.json({
      authenticated: Boolean(req.session.userId),
      admin: Boolean(req.session.role === "admin"),
    });
  });

  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.session.userId;

      if (!userId) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const user = await findUserById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ user });
    }),
  );

  return router;
}
