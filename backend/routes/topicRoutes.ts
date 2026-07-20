import { Router } from "express";
import { getTopics } from "../repositories/topicRepository";
import { asyncHandler } from "../middleware/asyncHandler";

export interface TopicRouterDependencies {
  getTopics: typeof getTopics;
}

const defaultDependencies: TopicRouterDependencies = { getTopics };

export function createTopicRouter(
  dependencies: TopicRouterDependencies = defaultDependencies,
) {
  const router = Router();

  router.get(
    "/topics",
    asyncHandler(async (_req, res) => {
      res.json({ topics: await dependencies.getTopics() });
    }),
  );

  return router;
}
