import { Router } from "express";
import { getTopics, addTopic } from "../repositories/topicRepository";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAdmin } from "../middleware/auth";

const maxTopicLength = 80;

export interface TopicRouterDependencies {
  getTopics: typeof getTopics;
  addTopic: typeof addTopic;
}

const defaultDependencies: TopicRouterDependencies = { getTopics, addTopic };

export function createTopicRouter(
  dependencies: TopicRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.get(
    "/topics",
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

  return router;
}
