import { Router } from "express";
import type { MatchActionType } from "../../shared/contracts";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  deleteMatchAction,
  getMatchAction,
  getMatchActions,
  setMatchAction,
} from "../repositories/matchActionRepository";
import {
  getIdParamValidationError,
  normalizeIdParam,
  normalizePageParam,
} from "../validation/routeValidation";

export interface MatchActionRouterDependencies {
  getMatchActions: typeof getMatchActions;
  getMatchAction: typeof getMatchAction;
  setMatchAction: typeof setMatchAction;
  deleteMatchAction: typeof deleteMatchAction;
}

const defaultDependencies: MatchActionRouterDependencies = {
  getMatchActions,
  getMatchAction,
  setMatchAction,
  deleteMatchAction,
};

function normalizeAction(value: unknown): MatchActionType | null {
  return value === "contacted" || value === "dismissed" ? value : null;
}

export function createMatchActionRouter(
  dependencies: MatchActionRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.get(
    "/match-actions",
    requireAuth,
    asyncHandler(async (req, res) => {
      const action = normalizeAction(req.query.action);
      const page = normalizePageParam(String(req.query.page ?? "0"));

      if (!action) {
        res.status(400).json({ message: "Choose contacted or dismissed" });
        return;
      }

      if (page === null) {
        res.status(400).json({ message: "Invalid page" });
        return;
      }

      const results = await dependencies.getMatchActions(
        req.session.userId!,
        action,
        page,
      );

      res.json({
        entries: results.slice(0, 10),
        hasNextPage: results.length > 10,
      });
    }),
  );

  router.get(
    "/match-actions/:memberId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const memberId = normalizeIdParam(req.params.memberId);
      const validationError = getIdParamValidationError(memberId);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const matchAction = await dependencies.getMatchAction(
        req.session.userId!,
        memberId,
      );

      res.json(matchAction ?? { action: null, actedAt: null });
    }),
  );

  router.put(
    "/match-actions/:memberId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const memberId = normalizeIdParam(req.params.memberId);
      const validationError = getIdParamValidationError(memberId);
      const action = normalizeAction(req.body.action);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      if (!action) {
        res.status(400).json({ message: "Choose contacted or dismissed" });
        return;
      }

      if (req.session.type !== "mentor" && req.session.type !== "mentee") {
        res.status(403).json({ message: "A mentorship role is required" });
        return;
      }

      const matchAction = await dependencies.setMatchAction(
        req.session.userId!,
        req.session.type,
        memberId,
        action,
      );

      if (!matchAction) {
        res.status(404).json({ message: "Eligible member not found" });
        return;
      }

      res.json(matchAction);
    }),
  );

  router.delete(
    "/match-actions/:memberId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const memberId = normalizeIdParam(req.params.memberId);
      const validationError = getIdParamValidationError(memberId);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      await dependencies.deleteMatchAction(req.session.userId!, memberId);
      res.status(204).end();
    }),
  );

  return router;
}
