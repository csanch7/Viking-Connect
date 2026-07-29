import { Router, type RequestHandler } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendContactUsEmail } from "../services/contactEmailService";
import {
  getContactValidationError,
  normalizeContactRequest,
} from "../validation/contactValidation";

export interface ContactRouterDependencies {
  sendContactUsEmail: typeof sendContactUsEmail;
}

const defaultDependencies: ContactRouterDependencies = {
  sendContactUsEmail,
};

export function createContactRouter(
  contactLimiter: RequestHandler,
  dependencies: ContactRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.post(
    "/",
    contactLimiter,
    asyncHandler(async (req, res) => {
      const emailRequest = normalizeContactRequest(req.body);
      const validationError = getContactValidationError(emailRequest);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      await dependencies.sendContactUsEmail(emailRequest);
      res.json({ message: "Message sent successfully" });
    }),
  );

  return router;
}
