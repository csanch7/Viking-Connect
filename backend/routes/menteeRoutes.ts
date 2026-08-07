import { Router } from "express";
import {
  findMenteeById,
  getMenteesByPagination,
} from "../repositories/menteeRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  getCollegeFilterValidationError,
  getFilterValidationError,
  getIdParamValidationError,
  getSearchTextValidationError,
  normalizeCollegeFilter,
  normalizeFilterQuery,
  normalizeIdParam,
  normalizePageParam,
  normalizeSearchText,
} from "../validation/routeValidation";

export interface MenteeRouterDependencies {
  findMenteeById: typeof findMenteeById;
  getMenteesByPagination: typeof getMenteesByPagination;
}

const defaultDependencies: MenteeRouterDependencies = {
  findMenteeById,
  getMenteesByPagination,
};

export function createMenteeRouter(
  dependencies: MenteeRouterDependencies = defaultDependencies,
) {
  const router = Router();
  const { findMenteeById, getMenteesByPagination } = dependencies;

  router.get(
    "/mentees/:paginator",
    requireAuth,
    asyncHandler(async (req, res) => {
      if (req.session.type !== "mentee" && req.session.role !== "admin") {
        res
          .status(403)
          .json({ message: "Only mentees and admins can view mentees" });
        return;
      }
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

      const collegeFilterValidationError = getCollegeFilterValidationError(
        req.query.collegeFilter,
      );

      if (collegeFilterValidationError) {
        res.status(400).json({ message: collegeFilterValidationError });
        return;
      }

      const collegeFilter = normalizeCollegeFilter(req.query.collegeFilter);

      const users = await getMenteesByPagination(
        page,
        filter,
        searchText,
        collegeFilter,
      );

      res.json(users);
    }),
  );

  router.get(
    "/mentee/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
      if (req.session.type !== "mentee" && req.session.role !== "admin") {
        res
          .status(403)
          .json({ message: "Only mentees and admins can view mentees" });
        return;
      }
      const id = normalizeIdParam(req.params.id);
      const validationError = getIdParamValidationError(id);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const mentee = await findMenteeById(id);

      if (!mentee) {
        res.status(404).json({ message: "Could not find mentee" });
        return;
      }

      res.json(mentee);
    }),
  );

  return router;
}
