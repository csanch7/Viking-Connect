import { sql } from "../database";

const collegeSearchResultLimit = 10;

export async function getColleges(searchText?: string): Promise<string[]> {
  const trimmedSearchText = searchText?.trim() ?? "";
  const searchPattern = `%${trimmedSearchText}%`;

  const rows = await sql`
    SELECT name
    FROM colleges
    WHERE ${trimmedSearchText === ""} OR name ILIKE ${searchPattern}
    ORDER BY name ASC
    LIMIT ${trimmedSearchText ? collegeSearchResultLimit : null}
  `;

  return rows.map((row) => String(row.name));
}

export async function findCollegeByName(college: string) {
  const rows = await sql`
    SELECT id::text, name
    FROM colleges
    WHERE name = ${college}
    LIMIT 1
  `;

  return rows[0] as { id: string; name: string } | undefined;
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
        AND deleted_on IS NULL
      RETURNING college_id
    )
    SELECT colleges.name AS college
    FROM updated_user
    LEFT JOIN colleges ON colleges.id = updated_user.college_id
  `;

  return rows[0] as { college: string | null } | undefined;
}
