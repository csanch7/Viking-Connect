import { sql } from "../database";
import type { BaseUser } from "./userRepository";

export type MentorDirectoryUser = Pick<
  BaseUser,
  | "id"
  | "name"
  | "email"
  | "linkedin"
  | "type"
  | "areasOfExpertise"
  | "gradYear"
>;

export type MentorProfileUser = BaseUser;

export async function getMentorsByPagination(
  page: number,
  expertiseFilters: string[] = [],
  searchText?: string,
  collegeFilter?: string,
): Promise<MentorDirectoryUser[]> {
  const batchSize = 10;
  const fetchSize = batchSize + 1;

  const college = collegeFilter?.trim() ?? "";
  const trimmedSearchText = searchText?.trim() ?? "";
  const searchPattern = `%${trimmedSearchText}%`;

  const rows = await sql`
    SELECT
      users.id::text,
      users.name,
      users.email,
      users.linkedin,
      users.type,
      users.grad_year AS "gradYear",
      COALESCE(
        (
          SELECT ARRAY_AGG(topics.name ORDER BY topics.name)
          FROM user_topics
          JOIN topics ON topics.id = user_topics.topic_id
          WHERE user_topics.user_id = users.id
        ),
        ARRAY[]::text[]
      ) AS "areasOfExpertise"
    FROM users
    LEFT JOIN colleges ON colleges.id = users.college_id
    WHERE users.type = 'mentor'
      AND users.status = 'approved'

      AND (
        ${expertiseFilters.length === 0}
        OR EXISTS (
          SELECT 1
          FROM user_topics
          JOIN topics ON topics.id = user_topics.topic_id
          WHERE user_topics.user_id = users.id
            AND topics.name = ANY(${expertiseFilters})
        )
      )

      AND (
        ${college === ""}
        OR colleges.name = ${college}
      )

      AND (
        ${trimmedSearchText === ""}
        OR users.name ILIKE ${searchPattern}
      )

    ORDER BY users.name, users.id
    LIMIT ${fetchSize}
    OFFSET ${page * batchSize}
  `;

  return rows as MentorDirectoryUser[];
}

export async function findMentorById(
  userId: string,
): Promise<MentorProfileUser | undefined> {
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
    AND users.type = 'mentor'
    AND users.status = 'approved'
    LIMIT 1
  `;

  return rows[0] as MentorProfileUser | undefined;
}
