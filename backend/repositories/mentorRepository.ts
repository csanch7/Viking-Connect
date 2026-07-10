import { sql } from "../database";
import type { BaseUser } from "./userRepository";

export type MentorDirectoryUser = Pick<
  BaseUser,
  "id" | "username" | "email" | "linkedin" | "areasOfExpertise"
>;

export type MentorProfileUser = BaseUser;

export async function getMentorsByPagination(
  paginator: number,
  filter: string[] = [],
  userId: string,
  searchText?: string,
): Promise<MentorDirectoryUser[]> {
  const batchSize = 10;
  const page = Math.max(0, Number.isFinite(paginator) ? paginator : 0);
  const trimmedSearchText = searchText?.trim() ?? "";
  const searchPattern = `%${trimmedSearchText}%`;

  const rows =
    filter.length > 0
      ? await sql`
          SELECT
            id::text,
            username,
            email,
            linkedin,
            aoe_list AS "areasOfExpertise"
          FROM users
          WHERE type = 'mentor'
            AND status = 'approved'
            AND id::text != ${userId}
            AND aoe_list ?| ${filter}
            AND (${trimmedSearchText === ""} OR username ILIKE ${searchPattern})
          ORDER BY username ASC, id ASC
          LIMIT ${batchSize} OFFSET ${page * batchSize}
        `
      : await sql`
          SELECT
            id::text,
            username,
            email,
            linkedin,
            aoe_list AS "areasOfExpertise"
          FROM users
          WHERE type = 'mentor'
            AND status = 'approved'
            AND id::text != ${userId}
            AND (${trimmedSearchText === ""} OR username ILIKE ${searchPattern})
          ORDER BY username ASC, id ASC
          LIMIT ${batchSize} OFFSET ${page * batchSize}
        `;

  return rows as MentorDirectoryUser[];
}

export async function findMentorById(
  userId: string,
): Promise<MentorProfileUser | undefined> {
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
    AND type = 'mentor'
    AND status = 'approved'
    LIMIT 1
  `;

  return rows[0] as MentorProfileUser | undefined;
}
