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
      "003_rename_username_to_name.sql",
      "004_rename_help_text_to_bio.sql",
      "005_normalize_user_topics.sql",
      "006_allow_duplicate_display_names.sql",
      "007_password_reset_tokens.sql",
      "008_add_college_relationship.sql",
      "009_enforce_case_insensitive_topic_names.sql",
    ]);
  });

  it("allows members to share the same display name", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "006_allow_duplicate_display_names.sql"),
      "utf8",
    );
    assert.match(sql, /DROP CONSTRAINT IF EXISTS users_name_key/);
  });

  it("stores single-use expiring password reset tokens", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "007_password_reset_tokens.sql"),
      "utf8",
    );
    assert.match(sql, /CREATE TABLE password_reset_tokens/);
    assert.match(sql, /expires_at TIMESTAMPTZ NOT NULL/);
  });

  it("adds a normalized college table and an indexed user relationship", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "008_add_college_relationship.sql"),
      "utf8",
    );

    assert.match(sql, /CREATE TABLE colleges/);
    assert.match(sql, /INSERT INTO colleges \(name\)/);
    assert.match(sql, /University of Illinois Chicago/);
    assert.match(sql, /ON CONFLICT \(name\) DO NOTHING/);
    assert.match(sql, /ADD COLUMN college_id BIGINT/);
    assert.match(sql, /FOREIGN KEY \(college_id\) REFERENCES colleges \(id\)/);
    assert.match(sql, /CREATE INDEX users_college_id_idx/);
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

  it("renames the user display name column without losing existing data", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "003_rename_username_to_name.sql"),
      "utf8",
    );

    assert.match(sql, /RENAME COLUMN username TO name/);
    assert.match(sql, /IF EXISTS/);
    assert.match(sql, /RENAME CONSTRAINT users_username_key TO users_name_key/);
    assert.match(sql, /RENAME TO users_type_status_name_id_idx/);
  });

  it("renames the profile text column to bio without losing existing data", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "004_rename_help_text_to_bio.sql"),
      "utf8",
    );

    assert.match(sql, /RENAME COLUMN help_text TO bio/);
  });

  it("normalizes existing expertise into topics and user-topic relationships", async () => {
    const sql = await fs.readFile(
      path.join(migrationsDirectory, "005_normalize_user_topics.sql"),
      "utf8",
    );

    assert.match(sql, /CREATE TABLE topics/);
    assert.match(sql, /CREATE TABLE user_topics/);
    assert.match(sql, /jsonb_array_elements_text\(users\.aoe_list\)/);
    assert.match(sql, /INSERT INTO user_topics/);
    assert.match(sql, /DROP COLUMN aoe_list/);
  });

  it("enforces case-insensitive topic names", async () => {
    const sql = await fs.readFile(
      path.join(
        migrationsDirectory,
        "009_enforce_case_insensitive_topic_names.sql",
      ),
      "utf8",
    );

    assert.match(sql, /PARTITION BY LOWER\(name\)/);
    assert.match(sql, /ON topics \(LOWER\(name\)\)/);
  });
});
