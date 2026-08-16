import {
  Router,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import type { User } from "../interfaces/userInterface";
import { createUser, isUniqueViolation } from "../repositories/userRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { hashPassword } from "../services/passwordService";
import { sendAdminRegistrationNotification } from "../services/registrationNotificationService";
import {
  getRegistrationValidationError,
  normalizeRegistrationUser,
} from "../validation/registrationValidation";
import type { UserType } from "../../shared/contracts";
import { getActiveTopics } from "../repositories/topicRepository";
import { getColleges } from "../repositories/collegeRepository";

export interface RegistrationRouterDependencies {
  createUser: typeof createUser;
  hashPassword: typeof hashPassword;
  isUniqueViolation: typeof isUniqueViolation;
  sendAdminRegistrationNotification: typeof sendAdminRegistrationNotification;
  getTopics: typeof getActiveTopics;
  getColleges: typeof getColleges;
}

const defaultDependencies: RegistrationRouterDependencies = {
  createUser,
  hashPassword,
  isUniqueViolation,
  sendAdminRegistrationNotification,
  getTopics: getActiveTopics,
  getColleges,
};

export function createRegistrationRouter(
  authLimiter: RequestHandler,
  dependencies: RegistrationRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const {
    createUser,
    hashPassword,
    isUniqueViolation,
    sendAdminRegistrationNotification,
    getTopics,
    getColleges,
  } = dependencies;

  router.post(
    "/",
    authLimiter,
    asyncHandler(async (req: Request<{}, {}, User>, res: Response) => {
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

      const allowedTopics = new Set(await getTopics());
      if (
        !normalizedUser.areasOfExpertise.every((topic) =>
          allowedTopics.has(topic),
        )
      ) {
        res.status(400).json({ message: "Choose valid topics" });
        return;
      }

      if (normalizedUser.college) {
        const allowedColleges = new Set(await getColleges());
        if (!allowedColleges.has(normalizedUser.college)) {
          res.status(400).json({ message: "Choose a valid college" });
          return;
        }
      }

      try {
        const passwordHash = await hashPassword(password);
        const createdUser = await createUser({
          ...normalizedUser,
          type: normalizedUser.type as UserType,
          role: "user",
          passwordHash,
        });

        void sendAdminRegistrationNotification(normalizedUser);

        res.status(201).json({
          message: "User created",
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            linkedin: createdUser.linkedin,
            type: createdUser.type,
            college: createdUser.college,
            bio: createdUser.bio,
            areasOfExpertise: createdUser.areasOfExpertise,
            gradYear: createdUser.gradYear,
            status: createdUser.status,
            role: createdUser.role,
          },
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          res.status(409).json({
            message: "An account with that email already exists",
          });
          return;
        }

        throw error;
      }
    }),
  );

  return router;
}
