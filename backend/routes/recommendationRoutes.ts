import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getMentorRecommendations } from "../repositories/recommendationRepository";

export interface RecommendationRouterDependencies {
  getMentorRecommendations: typeof getMentorRecommendations;
}

const defaultDependencies: RecommendationRouterDependencies = {
  getMentorRecommendations,
};

export function createRecommendationRouter(
  dependencies: RecommendationRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.get(
    "/recommendations/mentors",
    requireAuth,
    asyncHandler(async (req, res) => {
      if (req.session.type !== "mentee") {
        res.status(403).json({
          message: "Mentor recommendations are available to mentees",
        });
        return;
      }

      const recommendations = await dependencies.getMentorRecommendations(
        req.session.userId!,
      );

      res.json({ recommendations });
    }),
  );

  return router;
}
