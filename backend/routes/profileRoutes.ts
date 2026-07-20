import { Router, type RequestHandler } from "express";
import {
  updateAreasOfExpertise,
  updateBio,
} from "../repositories/userRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  getExpertiseListValidationError,
  getBioValidationError,
  normalizeExpertiseList,
  normalizeBio,
} from "../validation/profileValidation";
import {
  getIdParamValidationError,
  normalizeIdParam,
} from "../validation/routeValidation";

export interface ProfileRouterDependencies {
  updateAreasOfExpertise: typeof updateAreasOfExpertise;
  updateBio: typeof updateBio;
}

const defaultDependencies: ProfileRouterDependencies = {
  updateAreasOfExpertise,
  updateBio,
};

export function createProfileRouter(
  authLimiter: RequestHandler,
  dependencies: ProfileRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const { updateAreasOfExpertise, updateBio } = dependencies;

  router.patch(
    "/change-bio/:userId",
    requireAuth,
    authLimiter,
    asyncHandler(async (req, res) => {
      const userId = normalizeIdParam(req.params.userId);
      const bio = normalizeBio(req.body.bio);
      const idValidationError = getIdParamValidationError(userId);

      if (idValidationError) {
        res.status(400).json({ message: idValidationError });
        return;
      }

      if (userId !== req.session.userId) {
        res
          .status(403)
          .json({ message: "Unauthorized to change another's bio" });
        return;
      }

      const validationError = getBioValidationError(bio);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const updatedBio = await updateBio(bio, userId as string);

      if (!updatedBio) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }

      res.json({
        message: "Bio has been successfully updated",
        bio: updatedBio.bio,
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
        res.status(404).json({ message: "Profile not found" });
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
