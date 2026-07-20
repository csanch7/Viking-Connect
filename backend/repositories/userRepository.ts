import { sql } from "../database";
import type {
  PublicUser,
  UserRole,
  UserType,
} from "../../shared/contracts";

export type BaseUser = PublicUser;

export type DatabaseUser = BaseUser;

export interface DatabaseUserWithPassword extends BaseUser {
  passwordHash: string;
}

export async function createUser(input: {
  name: string;
  email: string;
  linkedin: string;
  type: UserType;
  bio: string;
  areasOfExpertise: string[];
  gradYear: number;
  role: UserRole;
  passwordHash: string;
}): Promise<DatabaseUserWithPassword> {
  const rows = await sql`
    WITH created_user AS (
      INSERT INTO users (
        name, email, linkedin, type, bio, grad_year, role, password_hash
      )
      VALUES (
        ${input.name},
        ${input.email.toLowerCase()},
        ${input.linkedin},
        ${input.type},
        ${input.bio},
        ${input.gradYear},
        ${input.role},
        ${input.passwordHash}
      )
      RETURNING *
    ),
    selected_topics AS (
      SELECT id, name
      FROM topics
      WHERE name = ANY(${input.areasOfExpertise})
    ),
    created_links AS (
      INSERT INTO user_topics (user_id, topic_id)
      SELECT created_user.id, selected_topics.id
      FROM created_user
      CROSS JOIN selected_topics
      ON CONFLICT (user_id, topic_id) DO NOTHING
      RETURNING topic_id
    )
    SELECT
      created_user.id::text,
      created_user.name,
      created_user.email,
      created_user.linkedin,
      created_user.type,
      created_user.bio,
      COALESCE(
        (SELECT ARRAY_AGG(selected_topics.name ORDER BY selected_topics.name)
         FROM selected_topics),
        ARRAY[]::text[]
      ) AS "areasOfExpertise",
      created_user.grad_year AS "gradYear",
      created_user.role,
      created_user.password_hash AS "passwordHash",
      created_user.status
    FROM created_user
  `;

  return rows[0] as DatabaseUserWithPassword;
}

export async function findUserByEmail(
  email: string,
): Promise<DatabaseUserWithPassword | undefined> {
  const rows = await sql`
    SELECT
      id::text,
      name,
      email,
      linkedin,
      type,
      bio,
      COALESCE(
        (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
         FROM user_topics
         JOIN topics ON topics.id = user_topics.topic_id
         WHERE user_topics.user_id = users.id),
        ARRAY[]::text[]
      ) AS "areasOfExpertise",
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
      name,
      email,
      linkedin,
      type,
      bio,
      COALESCE(
        (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
         FROM user_topics
         JOIN topics ON topics.id = user_topics.topic_id
         WHERE user_topics.user_id = users.id),
        ARRAY[]::text[]
      ) AS "areasOfExpertise",
      grad_year AS "gradYear",
      role,
      status
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0] as DatabaseUser | undefined;
}

export async function updateBio(bio: string, userId: string) {
  const rows = await sql`
    UPDATE
      users
    SET bio = ${bio}
    WHERE id = ${userId}
    RETURNING 
      bio
  `;

  return rows[0] as { bio: string } | undefined;
}

export async function updateAreasOfExpertise(
  areasOfExpertise: string[],
  userId: string,
) {
  const rows = await sql`
    WITH target_user AS (
      SELECT id
      FROM users
      WHERE id = ${userId}
    ),
    selected_topics AS (
      SELECT id, name
      FROM topics
      WHERE name = ANY(${areasOfExpertise})
    ),
    added_links AS (
      INSERT INTO user_topics (user_id, topic_id)
      SELECT target_user.id, selected_topics.id
      FROM target_user
      CROSS JOIN selected_topics
      ON CONFLICT (user_id, topic_id) DO NOTHING
      RETURNING topic_id
    ),
    removed_links AS (
      DELETE FROM user_topics
      WHERE user_id IN (SELECT id FROM target_user)
        AND topic_id NOT IN (SELECT id FROM selected_topics)
      RETURNING topic_id
    )
    SELECT COALESCE(
      (SELECT ARRAY_AGG(selected_topics.name ORDER BY selected_topics.name)
       FROM selected_topics),
      ARRAY[]::text[]
    ) AS "areasOfExpertise"
    FROM target_user
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
