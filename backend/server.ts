import { createApp } from "./app";
import { env } from "./config/env";
import { initializeDatabase } from "./database";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const staticDirectory =
  path.basename(serverDirectory) === "build"
    ? path.resolve(serverDirectory, "../dist")
    : path.resolve(serverDirectory, "dist");

async function startServer() {
  await initializeDatabase();

  const app = createApp({ staticDirectory });
  app.listen(env.port, () =>
    console.log(`Server started on http://localhost:${env.port}`),
  );
}

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
