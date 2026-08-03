import express from "express";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import session from "express-session";
import pgSession from "connect-pg-simple";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { createApiRouter, type ApiRouterOptions } from "./routes/apiRoutes";
import { requestContext } from "./middleware/requestContext";
import {
  getApiRateLimitKey,
  getAuthRateLimitKey,
} from "./middleware/rateLimitKey";

const PgSession = pgSession(session);

export interface AppOptions {
  apiDependencies?: ApiRouterOptions;
  isProduction?: boolean;
  sessionSecret?: string;
  sessionStore?: session.Store;
  staticDirectory?: string;
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const isProduction = options.isProduction ?? env.isProduction;
  const staticDirectory =
    options.staticDirectory ?? path.resolve(process.cwd(), "dist");
  const sessionStore =
    options.sessionStore ??
    new PgSession({
      conString: env.databaseUrl,
      tableName: "session",
      createTableIfMissing: true,
    });

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(requestContext);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "connect-src": ["'self'"],
          "img-src": ["'self'", "data:"],
          "script-src": ["'self'"],
          "style-src": ["'self'"],
          "base-uri": ["'self'"],
          "form-action": ["'self'"],
          "frame-ancestors": ["'none'"],
        },
      },
    }),
  );

  app.use(
    session({
      store: sessionStore,
      secret: options.sessionSecret ?? env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.use(express.json({ limit: "100kb" }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    keyGenerator: getApiRateLimitKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests; please try again later" },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: getAuthRateLimitKey,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts; please try again later" },
  });

  const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      message: "Too many messages; please try again later",
    },
  });

  app.use(
    "/api",
    createApiRouter(
      authLimiter,
      apiLimiter,
      contactLimiter,
      options.apiDependencies,
    ),
  );
  app.use("/api", errorHandler);

  app.use(express.static(staticDirectory));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(staticDirectory, "index.html"));
  });

  return app;
}
