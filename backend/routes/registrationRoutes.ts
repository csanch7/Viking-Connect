import { Router, type Request, type RequestHandler, type Response } from "express";
import type { User } from "../interfaces/userInterface";
import {
  createUser,
  isUniqueViolation,
} from "../repositories/userRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { hashPassword } from "../services/passwordService";
import { sendAdminRegistrationNotification } from "../services/registrationNotificationService";
import {
  getRegistrationValidationError,
  normalizeRegistrationUser,
} from "../validation/registrationValidation";

export function createRegistrationRouter(authLimiter: RequestHandler) {
  const router = Router();

  router.post("/", authLimiter, asyncHandler(async (req: Request<{}, {}, User>, res: Response) => {
    const { password } = req.body;
    const normalizedUser = normalizeRegistrationUser(req.body);
    const validationError = getRegistrationValidationError(
      normalizedUser,
      password,
    );

    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    try {
      const passwordHash = await hashPassword(password);
      const createdUser = await createUser({
        ...normalizedUser,
        role: "user",
        passwordHash,
      });

      void sendAdminRegistrationNotification(normalizedUser);

      res.status(201).json({
        message: "User created",
        user: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
          linkedin: createdUser.linkedin,
          type: createdUser.type,
          helpText: createdUser.helpText,
          areasOfExpertise: createdUser.areasOfExpertise,
          gradYear: createdUser.gradYear,
          status: createdUser.status,
          role: createdUser.role,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        res
          .status(409)
          .json({ message: "A user with that email or username already exists" });
        return;
      }

      throw error;
    }
  }));

  return router;
}
