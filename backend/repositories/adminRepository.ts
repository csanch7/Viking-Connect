import { sql } from "../database";
import type { BaseUser } from "./userRepository";

export type PendingUser = Omit<BaseUser, "status">;

type CountRow = { count: string };

export async function getPendingUsers(): Promise<PendingUser[]> {
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
