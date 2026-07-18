import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://test:test@localhost/test";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET ?? "integration-test-secret";
process.env.NODE_ENV = "test";

const { listMigrationFiles } = await import("../migrations/migrate");
const migrationsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

describe("database migrations", () => {
  it("discovers migrations in deterministic version order", async () => {
    assert.deepEqual(await listMigrationFiles(migrationsDirectory), [
      "001_initial_schema.sql",
      "002_user_constraints.sql",
    ]);
  });

  it("keeps required user constraints in versioned SQL", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "002_user_constraints.sql"),
      "utf8",
    );

    for (const constraint of [
      "users_type_check",
      "users_status_check",
      "users_role_check",
      "users_grad_year_check",
      "users_aoe_list_check",
    ]) {
      assert.match(sql, new RegExp(constraint));
    }
  });
});
