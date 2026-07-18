import { neon } from "@neondatabase/serverless";
import { env } from "./config/env";

export const sql = neon(env.databaseUrl);

export async function checkDatabase() {
  await sql`SELECT 1`;
}
