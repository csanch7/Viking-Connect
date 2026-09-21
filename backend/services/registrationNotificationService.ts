import { env, getRegistrationEmailConfig, getRegistrationAcceptanceConfig } from "../config/env";
import { renderAdminRegistrationEmail } from "../emails/adminRegistrationEmail";
import { renderRegistrationAcceptanceEmail } from "../emails/registrationAcceptanceEmail";
import type { RegistrationEmailUser } from "../validation/registrationValidation";
import { sendEmail } from "./emailService";
import { log, logError } from "./logger";

const adminPendingUsersPath = "/admin/pending-users";
const adminPendingUsersUrl = env.appUrl
  ? `${env.appUrl.replace(/\/$/, "")}${adminPendingUsersPath}`
  : adminPendingUsersPath;
const loginPath = "/login";
const loginUrl = env.appUrl
  ? `${env.appUrl.replace(/\/$/, "")}${loginPath}`
  : loginPath;

function renderAdminRegistrationText(user: RegistrationEmailUser) {
  const topicsLabel =
    user.type === "mentor" ? "Areas of expertise" : "Areas of interest";
  const topicsLine = `${topicsLabel}: ${
    user.areasOfExpertise?.length
      ? user.areasOfExpertise.join(", ")
      : "Not provided"
  }`;

  return `A new STL Mentor Program registration is waiting for review.

    Name: ${user.name}
    Email: ${user.email}
    Account type: ${user.type}
    Graduation year: ${user.gradYear ?? "N/A"}
    Bio: ${user.bio || "Not provided"}
    ${topicsLine}

    Review the registration at ${adminPendingUsersPath}.`;
}

export async function sendAdminRegistrationNotification(
  user: RegistrationEmailUser,
) {
  const config = getRegistrationEmailConfig();

  if (!config) {
    log("warn", "registration_email.skipped_missing_config");
    return;
  }

  try {
    const messageId = await sendEmail({
      from: config.from,
      to: config.to,
      subject: "STL Mentorship Program: New Registered ",
      html: renderAdminRegistrationEmail(
        user,
        adminPendingUsersUrl,
        adminPendingUsersPath,
      ),
      text: renderAdminRegistrationText(user),
    });
    log("info", "registration_email.sent", { messageId });
  } catch (error) {
    logError("registration_email.send_failed", error);
  }
}

export async function sendRegistrationAcceptanceEmail(
  email: string,
) {
  const config = getRegistrationAcceptanceConfig();
  if (!config) {
    log("warn", "registration_acceptance_email.skipped_missing_config");
    return;
  }

  try {
    const messageId = await sendEmail({
      from: config.from,
      to: email,
      subject: "Your Viking Connect account is approved",
      html: renderRegistrationAcceptanceEmail(loginUrl),
      text: `Welcome to Viking Connect!

Your account has been approved. You can now sign in and begin building relationships across the St. Laurence community.

Make your first connection:
- Complete your profile: Review your bio, contact details, and mentorship topics so the right people can find you.
- Explore the directory: Search approved mentors and mentees by name, topic, and college.
- Start a conversation: Reach out through a member's listed email or LinkedIn profile.

Sign in: ${loginUrl}

Viking Connect is a private community. Your profile and contact details are available only to approved members.

The Viking Connect Team`,
    });
    log("info", "registration_acceptance_email.sent", { messageId });
  } catch (error) {
    logError("registration_acceptance_email.send_failed", error);
  }
}
