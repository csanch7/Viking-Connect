import { Router } from "express";
import { getColleges } from "../repositories/collegeRepository";
import { asyncHandler } from "../middleware/asyncHandler";

export interface CollegeRouterDependencies {
  getColleges: typeof getColleges;
}

const defaultDependencies: CollegeRouterDependencies = { getColleges };

export function createCollegeRouter(
  dependencies: CollegeRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.get(
    "/colleges",
    asyncHandler(async (_req, res) => {
      res.set("Cache-Control", "public, max-age=300");
      res.json({ colleges: await dependencies.getColleges() });
    }),
  );

  return router;
}
