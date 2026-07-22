import { sql } from "../database";
import type { BaseUser } from "./userRepository";

export type MentorDirectoryUser = Pick<
  BaseUser,
  "id" | "name" | "email" | "linkedin" | "areasOfExpertise"
>;

export type MentorProfileUser = BaseUser;

export async function getMentorsByPagination(
  paginator: number,
  filter: string[] = [],
  userId: string,
  searchText?: string,
): Promise<MentorDirectoryUser[]> {
  const batchSize = 10;
  const fetchSize = batchSize + 1;
  const page = Math.max(0, Number.isFinite(paginator) ? paginator : 0);
  const trimmedSearchText = searchText?.trim() ?? "";
  const searchPattern = `%${trimmedSearchText}%`;

  const rows =
    filter.length > 0
      ? await sql`
          SELECT
            id::text,
            name,
            email,
            linkedin,
            COALESCE(
              (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
               FROM user_topics
               JOIN topics ON topics.id = user_topics.topic_id
               WHERE user_topics.user_id = users.id),
              ARRAY[]::text[]
            ) AS "areasOfExpertise"
          FROM users
          WHERE type = 'mentor'
            AND status = 'approved'
            AND id::text != ${userId}
            AND EXISTS (
              SELECT 1
              FROM user_topics
              JOIN topics ON topics.id = user_topics.topic_id
              WHERE user_topics.user_id = users.id
                AND topics.name = ANY(${filter})
            )
            AND (${trimmedSearchText === ""} OR name ILIKE ${searchPattern})
          ORDER BY name ASC, id ASC
          LIMIT ${fetchSize} OFFSET ${page * batchSize}
        `
      : await sql`
          SELECT
            id::text,
            name,
            email,
            linkedin,
            COALESCE(
              (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
               FROM user_topics
               JOIN topics ON topics.id = user_topics.topic_id
               WHERE user_topics.user_id = users.id),
              ARRAY[]::text[]
            ) AS "areasOfExpertise"
          FROM users
          WHERE type = 'mentor'
            AND status = 'approved'
            AND id::text != ${userId}
            AND (${trimmedSearchText === ""} OR name ILIKE ${searchPattern})
          ORDER BY name ASC, id ASC
          LIMIT ${fetchSize} OFFSET ${page * batchSize}
        `;

  return rows as MentorDirectoryUser[];
}

export async function findMentorById(
  userId: string,
): Promise<MentorProfileUser | undefined> {
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
    AND type = 'mentor'
    AND status = 'approved'
    LIMIT 1
  `;

  return rows[0] as MentorProfileUser | undefined;
}
