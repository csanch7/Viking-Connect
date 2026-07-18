import { Router } from "express";
import {
  findMentorById,
  getMentorsByPagination,
} from "../repositories/mentorRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  getFilterValidationError,
  getIdParamValidationError,
  getSearchTextValidationError,
  normalizeFilterQuery,
  normalizeIdParam,
  normalizePageParam,
  normalizeSearchText,
} from "../validation/routeValidation";

export interface MentorRouterDependencies {
  findMentorById: typeof findMentorById;
  getMentorsByPagination: typeof getMentorsByPagination;
}

const defaultDependencies: MentorRouterDependencies = {
  findMentorById,
  getMentorsByPagination,
};

export function createMentorRouter(
  dependencies: MentorRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const { findMentorById, getMentorsByPagination } = dependencies;

  router.get(
    "/mentors/:paginator",
    requireAuth,
    asyncHandler(async (req, res) => {
      const page = normalizePageParam(req.params.paginator);

      if (page === null) {
        res.status(400).json({ message: "Invalid page" });
        return;
      }

      const filter = normalizeFilterQuery(req.query.filter);
      const filterValidationError = getFilterValidationError(filter);

      if (filterValidationError) {
        res.status(400).json({ message: filterValidationError });
        return;
      }

      const searchText = normalizeSearchText(req.query.searchText);
      const searchValidationError = getSearchTextValidationError(searchText);

      if (searchValidationError) {
        res.status(400).json({ message: searchValidationError });
        return;
      }

      const users = await getMentorsByPagination(
        page,
        filter,
        req.session.userId as string,
        searchText,
      );

      res.json(users);
    }),
  );

  router.get(
    "/mentor/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
      const id = normalizeIdParam(req.params.id);
      const validationError = getIdParamValidationError(id);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const mentor = await findMentorById(id);

      if (!mentor) {
        res.status(404).json({ message: "Could not find mentor" });
        return;
      }

      res.json(mentor);
    }),
  );

  return router;
}
