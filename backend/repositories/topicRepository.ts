import { sql } from "../database";

export async function getTopics(): Promise<string[]> {
  const rows = await sql`
    SELECT name
    FROM topics
    ORDER BY name ASC
  `;

  return rows.map((row) => String(row.name));
}
