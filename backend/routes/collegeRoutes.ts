import { Router } from "express";
import { getColleges } from "../repositories/collegeRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  getSearchTextValidationError,
  normalizeSearchText,
} from "../validation/routeValidation";

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
    asyncHandler(async (req, res) => {
      const searchText = normalizeSearchText(req.query.searchText);
      const searchValidationError = getSearchTextValidationError(searchText);

      if (searchValidationError) {
        res.status(400).json({ message: searchValidationError });
        return;
      }
      res.set("Cache-Control", "public, max-age=300");
      res.json({ colleges: await dependencies.getColleges(searchText) });
    }),
  );

  return router;
}
