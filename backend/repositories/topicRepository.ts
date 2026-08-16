import { sql } from "../database";
import type { Topic } from "../../shared/contracts";

export async function getActiveTopics(): Promise<string[]> {
  const rows = await sql`
    SELECT name
    FROM topics
    WHERE is_active = TRUE
    ORDER BY name ASC
  `;

  return rows.map((row) => String(row.name));
}

export async function getTopics(): Promise<Topic[]> {
  const rows = await sql`
    SELECT id, name, is_active
    FROM topics
    ORDER BY name ASC
  `;

  return rows as Topic[];
}

export async function addTopic(topicName: string): Promise<Topic | null> {
  const rows = await sql`
    INSERT INTO topics (name)
    VALUES (${topicName})
    ON CONFLICT DO NOTHING
    RETURNING id, name, is_active
  `;

  return rows[0] ? (rows[0] as Topic) : null;
}

export async function changeTopicActivity(id: string): Promise<boolean | null> {
  const rows = await sql`
    UPDATE topics
    SET is_active = NOT is_active
    WHERE id = ${id}
    RETURNING
    is_active
  `;

  return rows[0] ? Boolean(rows[0].is_active) : null;
}
