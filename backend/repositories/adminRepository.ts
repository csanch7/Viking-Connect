import { sql } from "../database";
import type { BaseUser } from "./userRepository";

export type PendingUser = Omit<BaseUser, "status">;

type CountRow = { count: string };

export async function getPendingUsers(): Promise<PendingUser[]> {
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
      role
    FROM users
    WHERE status = 'pending'
  `;

  return rows as PendingUser[];
}

export async function denyUser(userId: string) {
  const rows = await sql`
    UPDATE
      users
    SET status = 'denied'
    WHERE id = ${userId}
    AND status = 'pending'
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
    AND status = 'pending'
    RETURNING id::text
  `;

  return rows[0] as { id: string } | undefined;
}

export async function deleteUser(userId: string) {
  const rows = await sql`
    WITH target_user AS (
      SELECT id
      FROM users
      WHERE id = ${userId}
        AND role = 'user'
    ),
    deleted_sessions AS (
      DELETE FROM session
      WHERE sess ->> 'userId' = (
        SELECT id::text FROM target_user
      )
    )
    DELETE FROM users
    WHERE id IN (SELECT id FROM target_user)
    RETURNING name
  `;

  return rows[0] as { name: string } | undefined;
}

export async function getMentorCount(): Promise<CountRow> {
  const rows = await sql`
    SELECT COUNT(*) 
    FROM users 
    WHERE type = 'mentor'
    AND status = 'approved'
  `;

  return rows[0] as CountRow;
}

export async function getMenteeCount(): Promise<CountRow> {
  const rows = await sql`
    SELECT COUNT(*) 
    FROM users 
    WHERE type = 'mentee'
    AND status = 'approved'
  `;

  return rows[0] as CountRow;
}
