import { Router } from "express";
import {
  updateAreasOfExpertise,
  updateBio,
  updateProfile,
} from "../repositories/userRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  getExpertiseListValidationError,
  getBioValidationError,
  normalizeExpertiseList,
  normalizeBio,
  normalizeCollege,
  normalizeUserType,
} from "../validation/profileValidation";
import {
  getIdParamValidationError,
  normalizeIdParam,
} from "../validation/routeValidation";
import { getActiveTopics } from "../repositories/topicRepository";
import {
  findCollegeByName,
  updateCollege,
} from "../repositories/collegeRepository";

export interface ProfileRouterDependencies {
  updateAreasOfExpertise: typeof updateAreasOfExpertise;
  updateBio: typeof updateBio;
  updateCollege: typeof updateCollege;
  updateProfile: typeof updateProfile;
  getTopics: typeof getActiveTopics;
  findCollegeByName: typeof findCollegeByName;
}

const defaultDependencies: ProfileRouterDependencies = {
  updateAreasOfExpertise,
  updateBio,
  updateCollege,
  updateProfile,
  getTopics: getActiveTopics,
  findCollegeByName,
};

export function createProfileRouter(
  dependencies: ProfileRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const {
    updateAreasOfExpertise,
    updateBio,
    updateCollege,
    updateProfile,
    getTopics,
    findCollegeByName,
  } = dependencies;

  router.patch(
    "/profile/:userId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = normalizeIdParam(req.params.userId);
      const idValidationError = getIdParamValidationError(userId);

      if (idValidationError) {
        res.status(400).json({ message: idValidationError });
        return;
      }

      if (userId !== req.session.userId) {
        res
          .status(403)
          .json({ message: "Unauthorized to change this profile" });
        return;
      }

      const type = normalizeUserType(req.body.type);
      const bio = normalizeBio(req.body.bio);
      const collegeInput = req.body.college;
      const college = normalizeCollege(collegeInput);
      const areasOfExpertise = normalizeExpertiseList(
        req.body.areasOfExpertise,
      );
      const bioValidationError = getBioValidationError(bio);
      const expertiseValidationError =
        getExpertiseListValidationError(areasOfExpertise);

      if (!type) {
        res.status(400).json({ message: "Choose mentor or mentee" });
        return;
      }

      if (bioValidationError) {
        res.status(400).json({ message: bioValidationError });
        return;
      }

      if (collegeInput !== null && typeof collegeInput !== "string") {
        res.status(400).json({ message: "Choose a valid college" });
        return;
      }

      if (expertiseValidationError) {
        res.status(400).json({ message: expertiseValidationError });
        return;
      }

      const [allowedTopics, selectedCollege] = await Promise.all([
        getTopics(),
        college ? findCollegeByName(college) : Promise.resolve(undefined),
      ]);

      if (!areasOfExpertise.every((topic) => allowedTopics.includes(topic))) {
        res.status(400).json({ message: "Choose valid areas of expertise" });
        return;
      }

      if (college && !selectedCollege) {
        res.status(400).json({ message: "Choose a valid college" });
        return;
      }

      const updatedProfile = await updateProfile(
        {
          type,
          bio,
          collegeId: selectedCollege?.id ?? null,
          areasOfExpertise,
        },
        userId as string,
      );

      if (!updatedProfile) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }

      req.session.type = updatedProfile.type;

      res.json({
        message: "Profile has been successfully updated",
        ...updatedProfile,
      });
    }),
  );

  router.patch(
    "/change-bio/:userId",
    requireAuth,
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
    "/change-college/:userId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = normalizeIdParam(req.params.userId);
      const collegeInput = req.body.college;
      const college = normalizeCollege(req.body.college);
      const idValidationError = getIdParamValidationError(userId);

      if (idValidationError) {
        res.status(400).json({ message: idValidationError });
        return;
      }

      if (userId !== req.session.userId) {
        res
          .status(403)
          .json({ message: "Unauthorized to change another's college" });
        return;
      }

      if (collegeInput !== null && typeof collegeInput !== "string") {
        res.status(400).json({ message: "Choose a valid college" });
        return;
      }

      if (college) {
        const selectedCollege = await findCollegeByName(college);
        if (!selectedCollege) {
          res.status(400).json({ message: "Choose a valid college" });
          return;
        }
      }

      const updatedCollege = await updateCollege(college, userId as string);

      if (!updatedCollege) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }

      res.json({
        message: "College has been successfully updated",
        college: updatedCollege.college,
      });
    }),
  );

  router.patch(
    "/change-areas-of-expertise/:userId",
    requireAuth,
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

      const allowedTopics = new Set(await getTopics());
      if (!areasOfExpertise.every((topic) => allowedTopics.has(topic))) {
        res.status(400).json({ message: "Choose valid areas of expertise" });
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
