import type {
  MatchAction,
  MatchActionEntry,
  MatchActionType,
  UserType,
} from "../../shared/contracts";
import { sql } from "../database";

type MatchActionRow = MatchActionEntry["member"] & {
  action: MatchActionType;
  actedAt: Date | string;
};

function serializeAction(row: MatchActionRow): MatchActionEntry {
  return {
    member: {
      id: row.id,
      name: row.name,
      email: row.email,
      linkedin: row.linkedin,
      type: row.type,
      gradYear: row.gradYear,
      areasOfExpertise: row.areasOfExpertise,
    },
    action: row.action,
    actedAt:
      row.actedAt instanceof Date ? row.actedAt.toISOString() : row.actedAt,
  };
}

export async function getMatchActions(
  actorUserId: string,
  action: MatchActionType,
  page: number,
): Promise<MatchActionEntry[]> {
  const batchSize = 10;
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
      ) AS "areasOfExpertise",
      member_match_actions.action,
      member_match_actions.acted_at AS "actedAt"
    FROM member_match_actions
    JOIN users ON users.id = member_match_actions.subject_user_id
    WHERE member_match_actions.actor_user_id = ${actorUserId}
      AND member_match_actions.action = ${action}
      AND users.status = 'approved'
      AND users.deleted_on IS NULL
    ORDER BY member_match_actions.acted_at DESC, users.name, users.id
    LIMIT ${batchSize + 1}
    OFFSET ${page * batchSize}
  `;

  return (rows as MatchActionRow[]).map(serializeAction);
}

export async function getMatchAction(
  actorUserId: string,
  subjectUserId: string,
): Promise<MatchAction | null> {
  const rows = await sql`
    SELECT action, acted_at AS "actedAt"
    FROM member_match_actions
    WHERE actor_user_id = ${actorUserId}
      AND subject_user_id = ${subjectUserId}
    LIMIT 1
  `;
  const row = rows[0] as { action: MatchActionType; actedAt: Date | string };

  if (!row) return null;

  return {
    action: row.action,
    actedAt:
      row.actedAt instanceof Date ? row.actedAt.toISOString() : row.actedAt,
  };
}

export async function setMatchAction(
  actorUserId: string,
  actorType: UserType,
  subjectUserId: string,
  action: MatchActionType,
): Promise<MatchAction | null> {
  const subjectType: UserType = actorType === "mentor" ? "mentee" : "mentor";
  const rows = await sql`
    INSERT INTO member_match_actions (
      actor_user_id,
      subject_user_id,
      action
    )
    SELECT ${actorUserId}, users.id, ${action}
    FROM users
    WHERE users.id = ${subjectUserId}
      AND users.type = ${subjectType}
      AND users.status = 'approved'
      AND users.deleted_on IS NULL
      AND users.id <> ${actorUserId}
    ON CONFLICT (actor_user_id, subject_user_id)
    DO UPDATE SET
      action = EXCLUDED.action,
      acted_at = CASE
        WHEN member_match_actions.action = EXCLUDED.action
          THEN member_match_actions.acted_at
        ELSE NOW()
      END
    RETURNING action, acted_at AS "actedAt"
  `;
  const row = rows[0] as
    | { action: MatchActionType; actedAt: Date | string }
    | undefined;

  if (!row) return null;

  return {
    action: row.action,
    actedAt:
      row.actedAt instanceof Date ? row.actedAt.toISOString() : row.actedAt,
  };
}

export async function deleteMatchAction(
  actorUserId: string,
  subjectUserId: string,
): Promise<void> {
  await sql`
    DELETE FROM member_match_actions
    WHERE actor_user_id = ${actorUserId}
      AND subject_user_id = ${subjectUserId}
  `;
}
