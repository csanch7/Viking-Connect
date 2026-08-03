import { sql } from "../database";

export async function getColleges(): Promise<string[]> {
  const rows = await sql`
    SELECT name
    FROM colleges
    ORDER BY name ASC
  `;

  return rows.map((row) => String(row.name));
}

export async function updateCollege(college: string | null, userId: string) {
  const rows = await sql`
    WITH updated_user AS (
      UPDATE users
      SET college_id = (
        SELECT id
        FROM colleges
        WHERE name = ${college}
      )
      WHERE id = ${userId}
      RETURNING college_id
    )
    SELECT colleges.name AS college
    FROM updated_user
    LEFT JOIN colleges ON colleges.id = updated_user.college_id
  `;

  return rows[0] as { college: string | null } | undefined;
}
