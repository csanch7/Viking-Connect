import express from "express";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import pgSession from "connect-pg-simple";
import helmet from "helmet";
import { env } from "./config/env";
import { initializeDatabase } from "./database";
import { errorHandler } from "./middleware/errorHandler";
import { createApiRouter } from "./routes/apiRoutes";

const app = express();
const PgSession = pgSession(session);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist");

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  session({
    store: new PgSession({
      conString: env.databaseUrl,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
);

app.use(express.json({ limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests; please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts; please try again later" },
});

app.use("/api", apiLimiter, createApiRouter(authLimiter));
app.use("/api", errorHandler);

app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

async function startServer() {
  await initializeDatabase();

  app.listen(env.port, () =>
    console.log(`Server started on http://localhost:${env.port}`),
  );
}

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
