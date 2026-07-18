import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { env } from "../config/env";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory =
  path.basename(moduleDirectory) === "build"
    ? path.join(moduleDirectory, "migrations")
    : moduleDirectory;
const migrationPattern = /^\d+_[a-z0-9_]+\.sql$/;

export async function listMigrationFiles(directory = migrationsDirectory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && migrationPattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

export async function runMigrations() {
  const client = new Client({ connectionString: env.databaseUrl });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const appliedResult = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations",
    );
    const applied = new Set(appliedResult.rows.map((row) => row.name));

    for (const migrationName of await listMigrationFiles()) {
      if (applied.has(migrationName)) {
        continue;
      }

      const migrationSql = await fs.readFile(
        path.join(migrationsDirectory, migrationName),
        "utf8",
      );

      await client.query("BEGIN");
      try {
        await client.query(migrationSql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          migrationName,
        ]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}
