import { createHash, randomBytes } from "node:crypto";
import { env, getPasswordResetEmailConfig } from "../config/env";
import { sendEmail } from "./emailService";
import { log, logError } from "./logger";

export function createPasswordResetSecret() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashPasswordResetToken(token) };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  requestOrigin: string,
) {
  const config = getPasswordResetEmailConfig();
  if (!config) {
    log("warn", "password_reset_email.skipped_missing_config");
    return;
  }

  const appOrigin = env.appUrl ?? requestOrigin;
  const resetUrl = `${appOrigin.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendEmail({
      from: config.from,
      to: email,
      subject: "Reset your STL Mentorship Program password",
      html: `<p>Use the link below to reset your password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      text: `Reset your STL Mentorship Program password within one hour: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    });
  } catch (error) {
    logError("password_reset_email.send_failed", error);
  }
}
