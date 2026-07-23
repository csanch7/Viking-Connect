import { Router, type RequestHandler } from "express";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
} from "../repositories/passwordResetRepository";
import { hashPassword } from "../services/passwordService";
import {
  createPasswordResetSecret,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "../services/passwordResetService";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  isStrongPassword,
  isValidEmail,
} from "../validation/registrationValidation";

export interface PasswordResetRouterDependencies {
  createPasswordResetToken: typeof createPasswordResetToken;
  consumePasswordResetToken: typeof consumePasswordResetToken;
  hashPassword: typeof hashPassword;
  createPasswordResetSecret: typeof createPasswordResetSecret;
  hashPasswordResetToken: typeof hashPasswordResetToken;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
}

const defaultDependencies: PasswordResetRouterDependencies = {
  createPasswordResetToken,
  consumePasswordResetToken,
  hashPassword,
  createPasswordResetSecret,
  hashPasswordResetToken,
  sendPasswordResetEmail,
};

export function createPasswordResetRouter(
  authLimiter: RequestHandler,
  dependencies: PasswordResetRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.post(
    "/forgot-password",
    authLimiter,
    asyncHandler(async (req, res) => {
      const email =
        typeof req.body.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";
      if (email.length > 254 || !isValidEmail(email)) {
        res.status(400).json({ message: "Enter a valid email address" });
        return;
      }

      const { token, tokenHash } = dependencies.createPasswordResetSecret();
      const reset = await dependencies.createPasswordResetToken(
        email,
        tokenHash,
        new Date(Date.now() + 60 * 60 * 1000),
      );
      if (reset) {
        void dependencies.sendPasswordResetEmail(
          reset.email,
          token,
          `${req.protocol}://${req.get("host")}`,
        );
      }

      res.json({ message: "If an account exists, a reset link has been sent" });
    }),
  );

  router.post(
    "/reset-password",
    authLimiter,
    asyncHandler(async (req, res) => {
      const token =
        typeof req.body.token === "string" ? req.body.token.trim() : "";
      const password = req.body.password;
      if (!token || token.length > 256) {
        res.status(400).json({ message: "Reset link is invalid or expired" });
        return;
      }
      if (typeof password !== "string" || !isStrongPassword(password)) {
        res
          .status(400)
          .json({ message: "Password does not meet the requirements" });
        return;
      }

      const passwordHash = await dependencies.hashPassword(password);
      const updated = await dependencies.consumePasswordResetToken(
        dependencies.hashPasswordResetToken(token),
        passwordHash,
      );
      if (!updated) {
        res.status(400).json({ message: "Reset link is invalid or expired" });
        return;
      }

      res.json({ message: "Password reset successfully" });
    }),
  );

  return router;
}
