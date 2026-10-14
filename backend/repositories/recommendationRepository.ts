import type {
  MenteeDirectoryUser,
  MenteeRecommendation,
  MentorDirectoryUser,
  MentorRecommendation,
} from "../../shared/contracts";
import { sql } from "../database";

type RecommendationRow = MentorDirectoryUser & {
  recommendationScore: number;
  coveragePercentage: number;
  sharedTopicCount: number;
  matchedTopics: string[];
  sameCollege: boolean;
};

type MenteeRecommendationRow = MenteeDirectoryUser & {
  recommendationScore: number;
  coveragePercentage: number;
  sharedTopicCount: number;
  matchedTopics: string[];
  sameCollege: boolean;
};

export function qualifiesAsRecommendation(match: {
  coveragePercentage: number;
  sharedTopicCount: number;
  sameCollege: boolean;
}) {
  return (
    match.sameCollege ||
    match.coveragePercentage >= 25 ||
    match.sharedTopicCount >= 2
  );
}

export async function getMentorRecommendations(
  menteeId: string,
): Promise<MentorRecommendation[]> {
  const rows = await sql`
    WITH mentee AS (
      SELECT id, college_id
      FROM users
      WHERE id = ${menteeId}
        AND type = 'mentee'
        AND status = 'approved'
        AND deleted_on IS NULL
    ),
    mentee_topics AS (
      SELECT user_topics.topic_id
      FROM user_topics
      JOIN mentee ON mentee.id = user_topics.user_id
    ),
    mentor_stats AS (
      SELECT
        mentors.id::text,
        mentors.name,
        mentors.email,
        mentors.linkedin,
        mentors.type,
        mentors.grad_year AS "gradYear",
        COALESCE(
          ARRAY_AGG(topics.name ORDER BY topics.name)
            FILTER (WHERE topics.id IS NOT NULL),
          ARRAY[]::text[]
        ) AS "areasOfExpertise",
        COALESCE(
          ARRAY_AGG(topics.name ORDER BY topics.name)
            FILTER (WHERE matched_topics.topic_id IS NOT NULL),
          ARRAY[]::text[]
        ) AS "matchedTopics",
        COUNT(matched_topics.topic_id)::int AS "sharedTopicCount",
        (SELECT COUNT(*)::int FROM mentee_topics) AS "menteeTopicCount",
        (
          mentee.college_id IS NOT NULL
          AND COALESCE(mentors.college_id = mentee.college_id, false)
        ) AS "sameCollege"
      FROM users mentors
      CROSS JOIN mentee
      LEFT JOIN user_topics mentor_topics
        ON mentor_topics.user_id = mentors.id
      LEFT JOIN topics ON topics.id = mentor_topics.topic_id
      LEFT JOIN mentee_topics matched_topics
        ON matched_topics.topic_id = mentor_topics.topic_id
      WHERE mentors.type = 'mentor'
        AND mentors.status = 'approved'
        AND mentors.deleted_on IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM member_match_actions
          WHERE member_match_actions.actor_user_id = mentee.id
            AND member_match_actions.subject_user_id = mentors.id
        )
      GROUP BY
        mentors.id,
        mentors.name,
        mentors.email,
        mentors.linkedin,
        mentors.type,
        mentors.grad_year,
        mentee.college_id
    )
    SELECT
      id,
      name,
      email,
      linkedin,
      type,
      "gradYear",
      "areasOfExpertise",
      "matchedTopics",
      "sharedTopicCount",
      "sameCollege",
      ROUND(
        "sharedTopicCount" * 100.0 / GREATEST("menteeTopicCount", 1)
      )::int AS "coveragePercentage",
      (
        ROUND(
          "sharedTopicCount" * 60.0 / GREATEST("menteeTopicCount", 1)
        )::int
        + LEAST("sharedTopicCount", 3) * 10
        + CASE WHEN "sameCollege" THEN 10 ELSE 0 END
      )::int AS "recommendationScore"
    FROM mentor_stats
    WHERE "sameCollege"
      OR "sharedTopicCount" >= 2
      OR (
        "sharedTopicCount" * 100.0 / GREATEST("menteeTopicCount", 1)
      ) >= 25
    ORDER BY "recommendationScore" DESC, name ASC, id ASC
    LIMIT 3
  `;

  return (rows as RecommendationRow[]).map((row) => ({
    mentor: {
      id: row.id,
      name: row.name,
      email: row.email,
      linkedin: row.linkedin,
      type: row.type,
      gradYear: row.gradYear,
      areasOfExpertise: row.areasOfExpertise,
    },
    recommendationScore: row.recommendationScore,
    coveragePercentage: row.coveragePercentage,
    sharedTopicCount: row.sharedTopicCount,
    matchedTopics: row.matchedTopics,
    sameCollege: row.sameCollege,
  }));
}

export async function getMenteeRecommendations(
  mentorId: string,
): Promise<MenteeRecommendation[]> {
  const rows = await sql`
    WITH mentor AS (
      SELECT id, college_id
      FROM users
      WHERE id = ${mentorId}
        AND type = 'mentor'
        AND status = 'approved'
        AND deleted_on IS NULL
    ),
    mentor_topics AS (
      SELECT user_topics.topic_id
      FROM user_topics
      JOIN mentor ON mentor.id = user_topics.user_id
    ),
    mentee_stats AS (
      SELECT
        mentees.id::text,
        mentees.name,
        mentees.email,
        mentees.linkedin,
        mentees.type,
        mentees.grad_year AS "gradYear",
        COALESCE(
          ARRAY_AGG(topics.name ORDER BY topics.name)
            FILTER (WHERE topics.id IS NOT NULL),
          ARRAY[]::text[]
        ) AS "areasOfExpertise",
        COALESCE(
          ARRAY_AGG(topics.name ORDER BY topics.name)
            FILTER (WHERE matched_topics.topic_id IS NOT NULL),
          ARRAY[]::text[]
        ) AS "matchedTopics",
        COUNT(matched_topics.topic_id)::int AS "sharedTopicCount",
        COUNT(mentee_topics.topic_id)::int AS "menteeTopicCount",
        (
          mentor.college_id IS NOT NULL
          AND COALESCE(mentees.college_id = mentor.college_id, false)
        ) AS "sameCollege"
      FROM users mentees
      CROSS JOIN mentor
      LEFT JOIN user_topics mentee_topics
        ON mentee_topics.user_id = mentees.id
      LEFT JOIN topics ON topics.id = mentee_topics.topic_id
      LEFT JOIN mentor_topics matched_topics
        ON matched_topics.topic_id = mentee_topics.topic_id
      WHERE mentees.type = 'mentee'
        AND mentees.status = 'approved'
        AND mentees.deleted_on IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM member_match_actions
          WHERE member_match_actions.actor_user_id = mentor.id
            AND member_match_actions.subject_user_id = mentees.id
        )
      GROUP BY
        mentees.id,
        mentees.name,
        mentees.email,
        mentees.linkedin,
        mentees.type,
        mentees.grad_year,
        mentor.college_id
    )
    SELECT
      id,
      name,
      email,
      linkedin,
      type,
      "gradYear",
      "areasOfExpertise",
      "matchedTopics",
      "sharedTopicCount",
      "sameCollege",
      ROUND(
        "sharedTopicCount" * 100.0 / GREATEST("menteeTopicCount", 1)
      )::int AS "coveragePercentage",
      (
        ROUND(
          "sharedTopicCount" * 60.0 / GREATEST("menteeTopicCount", 1)
        )::int
        + LEAST("sharedTopicCount", 3) * 10
        + CASE WHEN "sameCollege" THEN 10 ELSE 0 END
      )::int AS "recommendationScore"
    FROM mentee_stats
    WHERE "sameCollege"
      OR "sharedTopicCount" >= 2
      OR (
        "sharedTopicCount" * 100.0 / GREATEST("menteeTopicCount", 1)
      ) >= 25
    ORDER BY "recommendationScore" DESC, name ASC, id ASC
    LIMIT 3
  `;

  return (rows as MenteeRecommendationRow[]).map((row) => ({
    mentee: {
      id: row.id,
      name: row.name,
      email: row.email,
      linkedin: row.linkedin,
      type: row.type,
      gradYear: row.gradYear,
      areasOfExpertise: row.areasOfExpertise,
    },
    recommendationScore: row.recommendationScore,
    coveragePercentage: row.coveragePercentage,
    sharedTopicCount: row.sharedTopicCount,
    matchedTopics: row.matchedTopics,
    sameCollege: row.sameCollege,
  }));
}
