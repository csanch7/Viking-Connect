import { sql } from "../database";

export async function getTopics(): Promise<string[]> {
  const rows = await sql`
    SELECT name
    FROM topics
    ORDER BY name ASC
  `;

  return rows.map((row) => String(row.name));
}

export async function addTopic(topicName: string): Promise<string | null> {
  const rows = await sql`
    INSERT INTO topics (name)
    VALUES (${topicName})
    ON CONFLICT DO NOTHING
    RETURNING name
  `;

  return rows[0] ? String(rows[0].name) : null;
}
