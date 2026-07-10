import { Router, type RequestHandler } from "express";
import { createAdminRouter } from "./adminRoutes";
import { createAuthRouter } from "./authRoutes";
import { createMentorRouter } from "./mentorRoutes";
import { createProfileRouter } from "./profileRoutes";
import { createRegistrationRouter } from "./registrationRoutes";

export function createApiRouter(authLimiter: RequestHandler) {
  const router = Router();

  router.get("/health", async (_req, res) => {
    res.send("STL Mentor API");
  });

  router.use("/auth", createAuthRouter(authLimiter));
  router.use("/register", createRegistrationRouter(authLimiter));
  router.use("/admin", createAdminRouter());
  router.use(createMentorRouter());
  router.use(createProfileRouter(authLimiter));

  return router;
}
