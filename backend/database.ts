import { neon } from "@neondatabase/serverless";
import { env } from "./config/env";

export const sql = neon(env.databaseUrl);

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      linkedin TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL,
      help_text TEXT NOT NULL DEFAULT '',
      aoe_list JSONB NOT NULL DEFAULT '[]'::jsonb,
      grad_year INTEGER NOT NULL,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS users_status_type_idx
    ON users (status, type)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS users_type_status_username_id_idx
    ON users (type, status, username, id)
  `;
}
