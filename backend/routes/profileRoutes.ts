import { Router, type RequestHandler } from "express";
import {
  updateAreasOfExpertise,
  updateHelpText,
} from "../repositories/userRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  getExpertiseListValidationError,
  getHelpTextValidationError,
  normalizeExpertiseList,
  normalizeHelpText,
} from "../validation/profileValidation";
import {
  getIdParamValidationError,
  normalizeIdParam,
} from "../validation/routeValidation";

export interface ProfileRouterDependencies {
  updateAreasOfExpertise: typeof updateAreasOfExpertise;
  updateHelpText: typeof updateHelpText;
}

const defaultDependencies: ProfileRouterDependencies = {
  updateAreasOfExpertise,
  updateHelpText,
};

export function createProfileRouter(
  authLimiter: RequestHandler,
  dependencies: ProfileRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const { updateAreasOfExpertise, updateHelpText } = dependencies;

  router.patch(
    "/change-text/:userId",
    requireAuth,
    authLimiter,
    asyncHandler(async (req, res) => {
      const userId = normalizeIdParam(req.params.userId);
      const helpText = normalizeHelpText(req.body.helpText);
      const idValidationError = getIdParamValidationError(userId);

      if (idValidationError) {
        res.status(400).json({ message: idValidationError });
        return;
      }

      if (userId !== req.session.userId) {
        res
          .status(403)
          .json({ message: "Unauthorized to change another's help text" });
        return;
      }

      const validationError = getHelpTextValidationError(helpText);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const updatedHelpText = await updateHelpText(helpText, userId as string);

      if (!updatedHelpText) {
        res.status(404).json({ message: "Mentee profile not found" });
        return;
      }

      res.json({
        message: "Help text has been successfully updated",
        helpText: updatedHelpText.helpText,
      });
    }),
  );

  router.patch(
    "/change-areas-of-expertise/:userId",
    requireAuth,
    authLimiter,
    asyncHandler(async (req, res) => {
      const userId = normalizeIdParam(req.params.userId);
      const areasOfExpertise = normalizeExpertiseList(
        req.body.areasOfExpertise,
      );
      const idValidationError = getIdParamValidationError(userId);

      if (idValidationError) {
        res.status(400).json({ message: idValidationError });
        return;
      }

      if (userId !== req.session.userId) {
        res.status(403).json({
          message: "Unauthorized to change another's areas of expertise",
        });
        return;
      }

      const validationError = getExpertiseListValidationError(areasOfExpertise);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const updatedAreasOfExpertise = await updateAreasOfExpertise(
        areasOfExpertise,
        userId as string,
      );

      if (!updatedAreasOfExpertise) {
        res.status(404).json({ message: "Mentor profile not found" });
        return;
      }

      res.json({
        message: "Areas of expertise have been successfully updated",
        areasOfExpertise: updatedAreasOfExpertise.areasOfExpertise,
      });
    }),
  );

  return router;
}
