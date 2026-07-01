import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const sql = neon(databaseUrl);

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  linkedin: string;
  type: string;
  helpText: string;
  aoeList: string[];
  gradYear: number;
  status: string;
  role: ("admin" | "user");
  passwordHash: string;
  
}

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
}

export async function createUser(input: {
  username: string;
  email: string;
  linkedin: string;
  type: string;
  helpText: string;
  aoeList: string[];
  gradYear: number;
  role: string;
  passwordHash: string;
  
}): Promise<DatabaseUser> {
  const rows = await sql`
    INSERT INTO users (
      username, email, linkedin, type, help_text, aoe_list, grad_year, role, password_hash
    )
    VALUES (
      ${input.username},
      ${input.email.toLowerCase()},
      ${input.linkedin},
      ${input.type},
      ${input.helpText},
      ${JSON.stringify(input.aoeList)}::jsonb,
      ${input.gradYear},
      ${input.role},
      ${input.passwordHash}
    )
    RETURNING
      id::text,
      username,
      email,
      linkedin,
      type,
      help_text AS "helpText",
      aoe_list AS "aoeList",
      grad_year AS "gradYear",
      role,
      password_hash AS "passwordHash",
      status
      
  `;

  return rows[0] as DatabaseUser;
}

export async function findUserByEmail(email: string): Promise<DatabaseUser | undefined> {
  const rows = await sql`
    SELECT
      id::text,
      username,
      email,
      linkedin,
      type,
      help_text AS "helpText",
      aoe_list AS "aoeList",
      grad_year AS "gradYear",
      role,
      password_hash AS "passwordHash",
      status
      
    FROM users
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `;

  return rows[0] as DatabaseUser | undefined;
}

export async function getMentorsByPagination(paginator: number): Promise<DatabaseUser[] | undefined> {
  let batchSize : number = 10;
  const rows = await sql`
    SELECT
      id::text,
      username,
      email,
      linkedin,
      aoe_list AS "aoeList"
    FROM users
    WHERE type = 'mentor'
    LIMIT ${batchSize} OFFSET ${paginator * batchSize}
  `;

  return rows as DatabaseUser[] | undefined;
}

export async function findUserById(userId: string): Promise<DatabaseUser | undefined> {
  const rows = await sql`
    SELECT
      id::text,
      username,
      email,
      linkedin,
      type,
      help_text AS "helpText",
      aoe_list AS "aoeList",
      grad_year AS "gradYear",
      role,
      status
      
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0] as DatabaseUser | undefined;
}

export async function getPendingUsers(): Promise<DatabaseUser[] | undefined> {
  const rows = await sql`
    SELECT
      id::text,
      username,
      email,
      linkedin,
      type,
      help_text AS "helpText",
      aoe_list AS "aoeList",
      grad_year AS "gradYear",
      role
      
    FROM users
    WHERE status = 'pending'
  `;

  return rows as DatabaseUser[] | undefined;
}

export async function denyUser(userId: string) {
  const rows = await sql`
    UPDATE
      users
    SET status = 'denied'
    WHERE id = ${userId}
    RETURNING id::text
  `;

  return rows[0] as { id: string } | undefined;
}

export async function approveUser(userId: string) {
  const rows = await sql`
    UPDATE
      users
    SET status = 'approved'
    WHERE id = ${userId}
    RETURNING id::text
  `;

  return rows[0] as { id: string } | undefined;
}

export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
