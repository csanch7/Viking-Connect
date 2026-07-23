import { sql } from "../database";

export async function createPasswordResetToken(
  email: string,
  tokenHash: string,
  expiresAt: Date,
) {
  const rows = await sql`
    WITH target_user AS (
      SELECT id, email
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    ),
    removed_tokens AS (
      DELETE FROM password_reset_tokens
      WHERE user_id IN (SELECT id FROM target_user)
    ),
    created_token AS (
      INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
      SELECT ${tokenHash}, id, ${expiresAt}
      FROM target_user
      RETURNING user_id
    )
    SELECT target_user.email
    FROM target_user
    JOIN created_token ON created_token.user_id = target_user.id
  `;

  return rows[0] as { email: string } | undefined;
}

export async function consumePasswordResetToken(
  tokenHash: string,
  passwordHash: string,
) {
  const rows = await sql`
    WITH valid_token AS (
      DELETE FROM password_reset_tokens
      WHERE token_hash = ${tokenHash}
        AND expires_at > NOW()
      RETURNING user_id
    )
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id IN (SELECT user_id FROM valid_token)
    RETURNING id::text
  `;

  return rows[0] as { id: string } | undefined;
}
