import { runMigrations } from "../migrations/migrate";
import { log, logError } from "../services/logger";

async function migrate() {
  log("info", "database.migration_started");
  await runMigrations();
  log("info", "database.migration_completed");
}

migrate().catch((error) => {
  logError("database.migration_failed", error);
  process.exit(1);
});
