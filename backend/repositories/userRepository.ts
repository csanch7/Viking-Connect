import { sql } from "../database";

export interface BaseUser {
  id: string;
  username: string;
  email: string;
  linkedin: string;
  type: string;
  helpText: string;
  areasOfExpertise: string[];
  gradYear: number;
  status: string;
  role: "admin" | "user";
}

export type DatabaseUser = BaseUser;

export interface DatabaseUserWithPassword extends BaseUser {
  passwordHash: string;
}

export async function createUser(input: {
  username: string;
  email: string;
  linkedin: string;
  type: string;
  helpText: string;
  areasOfExpertise: string[];
  gradYear: number;
  role: "admin" | "user";
  passwordHash: string;
}): Promise<DatabaseUserWithPassword> {
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
      ${JSON.stringify(input.areasOfExpertise)}::jsonb,
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
      aoe_list AS "areasOfExpertise",
      grad_year AS "gradYear",
      role,
      password_hash AS "passwordHash",
      status
  `;

  return rows[0] as DatabaseUserWithPassword;
}

export async function findUserByEmail(
  email: string,
): Promise<DatabaseUserWithPassword | undefined> {
  const rows = await sql`
    SELECT
      id::text,
      username,
      email,
      linkedin,
      type,
      help_text AS "helpText",
      aoe_list AS "areasOfExpertise",
      grad_year AS "gradYear",
      role,
      password_hash AS "passwordHash",
      status
    FROM users
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `;

  return rows[0] as DatabaseUserWithPassword | undefined;
}

export async function findUserById(
  userId: string,
): Promise<DatabaseUser | undefined> {
  const rows = await sql`
    SELECT
      id::text,
      username,
      email,
      linkedin,
      type,
      help_text AS "helpText",
      aoe_list AS "areasOfExpertise",
      grad_year AS "gradYear",
      role,
      status
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0] as DatabaseUser | undefined;
}

export async function updateHelpText(helpText: string, userId: string) {
  const rows = await sql`
    UPDATE
      users
    SET help_text = ${helpText}
    WHERE id = ${userId}
    AND type = 'mentee'
    RETURNING 
      help_text AS "helpText"
  `;

  return rows[0] as { helpText: string } | undefined;
}

export async function updateAreasOfExpertise(
  areasOfExpertise: string[],
  userId: string,
) {
  const rows = await sql`
    UPDATE
      users
    SET aoe_list = ${JSON.stringify(areasOfExpertise)}::jsonb
    WHERE id = ${userId}
    AND type = 'mentor'
    RETURNING 
      aoe_list AS "areasOfExpertise"
  `;

  return rows[0] as { areasOfExpertise: string[] } | undefined;
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
