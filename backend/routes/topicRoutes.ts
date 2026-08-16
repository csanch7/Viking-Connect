import { Router } from "express";
import {
  addTopic,
  getActiveTopics,
  getTopics,
  changeTopicActivity,
} from "../repositories/topicRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import {
  getIdParamValidationError,
  normalizeIdParam,
} from "../validation/routeValidation";

const maxTopicLength = 80;

export interface TopicRouterDependencies {
  getActiveTopics: typeof getActiveTopics;
  getTopics: typeof getTopics;
  addTopic: typeof addTopic;
  changeTopicActivity: typeof changeTopicActivity;
}

const defaultDependencies: TopicRouterDependencies = {
  getActiveTopics,
  getTopics,
  addTopic,
  changeTopicActivity,
};

export function createTopicRouter(
  dependencies: TopicRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.get(
    "/active-topics",
    asyncHandler(async (_req, res) => {
      res.set("Cache-Control", "no-store");
      res.json({ topics: await dependencies.getActiveTopics() });
    }),
  );

  router.get(
    "/topics",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      res.set("Cache-Control", "no-store");
      res.json({ topics: await dependencies.getTopics() });
    }),
  );

  router.post(
    "/topics",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const topic =
        typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

      if (!topic || topic.length > maxTopicLength) {
        return res.status(400).json({
          message: `Topic must be between 1 and ${maxTopicLength} characters`,
        });
      }

      const createdTopic = await dependencies.addTopic(topic);
      if (!createdTopic) {
        return res.status(409).json({ message: "Topic already exists" });
      }

      return res.status(201).json({ topic: createdTopic });
    }),
  );

  router.put(
    "/topics/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const id = normalizeIdParam(req.params.id);

      const validationError = getIdParamValidationError(id);

      if (validationError) {
        res.status(400).json({ message: validationError });
        return;
      }

      const updatedTopicActivity = await dependencies.changeTopicActivity(id);
      if (updatedTopicActivity === null) {
        return res.status(404).json({ message: "Topic not found" });
      }

      return res.json({ is_active: updatedTopicActivity });
    }),
  );

  return router;
}
