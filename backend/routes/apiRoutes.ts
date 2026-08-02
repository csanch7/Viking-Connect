import { Router, type RequestHandler } from "express";
import { createAdminRouter } from "./adminRoutes";
import { createAuthRouter } from "./authRoutes";
import { createMentorRouter } from "./mentorRoutes";
import { createProfileRouter } from "./profileRoutes";
import { createRegistrationRouter } from "./registrationRoutes";
import { createTopicRouter } from "./topicRoutes";
import { createPasswordResetRouter } from "./passwordResetRoutes";
import type { PasswordResetRouterDependencies } from "./passwordResetRoutes";
import type { AuthRouterDependencies } from "./authRoutes";
import type { AdminRouterDependencies } from "./adminRoutes";
import type { MentorRouterDependencies } from "./mentorRoutes";
import type { ProfileRouterDependencies } from "./profileRoutes";
import type { RegistrationRouterDependencies } from "./registrationRoutes";
import type { TopicRouterDependencies } from "./topicRoutes";
import { createContactRouter } from "./contactRoutes";
import type { ContactRouterDependencies } from "./contactRoutes";
import { checkDatabase } from "../database";
import { createMenteeRouter } from "./menteeRoutes";
import type { MenteeRouterDependencies } from "./menteeRoutes";

export interface ApiRouterOptions {
  adminDependencies?: AdminRouterDependencies;
  authDependencies?: AuthRouterDependencies;
  mentorDependencies?: MentorRouterDependencies;
  menteeDependencies?: MenteeRouterDependencies;
  profileDependencies?: ProfileRouterDependencies;
  registrationDependencies?: RegistrationRouterDependencies;
  topicDependencies?: TopicRouterDependencies;
  contactDependencies?: ContactRouterDependencies;
  readinessCheck?: () => Promise<void>;
  passwordResetDependencies?: PasswordResetRouterDependencies;
}

export function createApiRouter(
  authLimiter: RequestHandler,
  apiLimiter: RequestHandler,
  contactLimiter: RequestHandler,
  options: ApiRouterOptions = {},
) {
  const router = Router();

  router.get("/health", async (_req, res) => {
    res.json({ status: "ok" });
  });

  router.get("/ready", async (_req, res) => {
    try {
      await (options.readinessCheck ?? checkDatabase)();
      res.json({ status: "ready" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });

  router.use(apiLimiter);

  router.use("/auth", createAuthRouter(authLimiter, options.authDependencies));
  router.use(
    "/auth",
    createPasswordResetRouter(authLimiter, options.passwordResetDependencies),
  );
  router.use(
    "/register",
    createRegistrationRouter(authLimiter, options.registrationDependencies),
  );
  router.use(
    "/contact-us",
    createContactRouter(contactLimiter, options.contactDependencies),
  );
  router.use(createTopicRouter(options.topicDependencies));
  router.use("/admin", createAdminRouter(options.adminDependencies));
  router.use(createMentorRouter(options.mentorDependencies));
  router.use(createProfileRouter(options.profileDependencies));
  router.use(createMenteeRouter(options.menteeDependencies));

  return router;
}
