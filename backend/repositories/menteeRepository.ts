import { sql } from "../database";
import type { BaseUser } from "./userRepository";

export type MenteeDirectoryUser = Pick<
  BaseUser,
  "id" | "name" | "email" | "linkedin" | "type" | "areasOfExpertise"
>;

export type MenteeProfileUser = BaseUser;

export async function getMenteesByPagination(
  paginator: number,
  filter: string[] = [],
  searchText?: string,
): Promise<MenteeDirectoryUser[]> {
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
            type,
            COALESCE(
              (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
               FROM user_topics
               JOIN topics ON topics.id = user_topics.topic_id
               WHERE user_topics.user_id = users.id),
              ARRAY[]::text[]
            ) AS "areasOfExpertise"
          FROM users
          WHERE type = 'mentee'
            AND status = 'approved'
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
            type,
            COALESCE(
              (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
               FROM user_topics
               JOIN topics ON topics.id = user_topics.topic_id
               WHERE user_topics.user_id = users.id),
              ARRAY[]::text[]
            ) AS "areasOfExpertise"
          FROM users
          WHERE type = 'mentee'
            AND status = 'approved'
            AND (${trimmedSearchText === ""} OR name ILIKE ${searchPattern})
          ORDER BY name ASC, id ASC
          LIMIT ${fetchSize} OFFSET ${page * batchSize}
        `;

  return rows as MenteeDirectoryUser[];
}

export async function findMenteeById(
  userId: string,
): Promise<MenteeProfileUser | undefined> {
  const rows = await sql`
    SELECT
      users.id::text,
      users.name,
      users.email,
      users.linkedin,
      users.type,
      colleges.name AS "college",
      users.bio,
      COALESCE(
        (SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
         FROM user_topics
         JOIN topics ON topics.id = user_topics.topic_id
         WHERE user_topics.user_id = users.id),
        ARRAY[]::text[]
      ) AS "areasOfExpertise",
      users.grad_year AS "gradYear",
      users.role,
      users.status
    FROM users
    LEFT JOIN colleges ON colleges.id = users.college_id
    WHERE users.id = ${userId}
    AND users.type = 'mentee'
    AND users.status = 'approved'
    LIMIT 1
  `;

  return rows[0] as MenteeProfileUser | undefined;
}
