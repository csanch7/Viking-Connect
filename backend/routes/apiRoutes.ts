import { Router, type RequestHandler } from "express";
import { createAdminRouter } from "./adminRoutes";
import { createAuthRouter } from "./authRoutes";
import { createMentorRouter } from "./mentorRoutes";
import { createProfileRouter } from "./profileRoutes";
import { createRegistrationRouter } from "./registrationRoutes";
import type { AuthRouterDependencies } from "./authRoutes";
import type { AdminRouterDependencies } from "./adminRoutes";
import type { MentorRouterDependencies } from "./mentorRoutes";
import type { ProfileRouterDependencies } from "./profileRoutes";
import type { RegistrationRouterDependencies } from "./registrationRoutes";

export interface ApiRouterOptions {
  adminDependencies?: AdminRouterDependencies;
  authDependencies?: AuthRouterDependencies;
  mentorDependencies?: MentorRouterDependencies;
  profileDependencies?: ProfileRouterDependencies;
  registrationDependencies?: RegistrationRouterDependencies;
}

export function createApiRouter(
  authLimiter: RequestHandler,
  options: ApiRouterOptions = {},
) {
  const router = Router();

  router.get("/health", async (_req, res) => {
    res.send("STL Mentor API");
  });

  router.use("/auth", createAuthRouter(authLimiter, options.authDependencies));
  router.use(
    "/register",
    createRegistrationRouter(authLimiter, options.registrationDependencies),
  );
  router.use("/admin", createAdminRouter(options.adminDependencies));
  router.use(createMentorRouter(options.mentorDependencies));
  router.use(createProfileRouter(authLimiter, options.profileDependencies));

  return router;
}
