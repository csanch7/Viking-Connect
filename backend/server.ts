import { createApp } from "./app";
import { env } from "./config/env";
import { runMigrations } from "./migrations/migrate";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { log, logError } from "./services/logger";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const staticDirectory =
  path.basename(serverDirectory) === "build"
    ? path.resolve(serverDirectory, "../dist")
    : path.resolve(serverDirectory, "dist");

async function startServer() {
  await runMigrations();

  const app = createApp({ staticDirectory });
  const server = app.listen(env.port, () => {
    log("info", "server.started", { port: env.port });
  });

  let isShuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    log("info", "server.shutdown_started", { signal });

    const forceShutdown = setTimeout(() => {
      log("error", "server.shutdown_timeout", { signal });
      process.exit(1);
    }, 10_000);
    forceShutdown.unref();

    server.close((error) => {
      clearTimeout(forceShutdown);
      if (error) {
        logError("server.shutdown_failed", error, { signal });
        process.exit(1);
      }

      log("info", "server.shutdown_complete", { signal });
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch((error) => {
  logError("server.start_failed", error);
  process.exit(1);
});
