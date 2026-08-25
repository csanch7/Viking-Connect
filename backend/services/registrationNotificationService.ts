import { env, getRegistrationEmailConfig } from "../config/env";
import { renderAdminRegistrationEmail } from "../emails/adminRegistrationEmail";
import type { RegistrationEmailUser } from "../validation/registrationValidation";
import { sendEmail } from "./emailService";
import { log, logError } from "./logger";

const adminPendingUsersPath = "/admin/pending-users";
const adminPendingUsersUrl = env.appUrl
  ? `${env.appUrl.replace(/\/$/, "")}${adminPendingUsersPath}`
  : adminPendingUsersPath;

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
    await sendEmail({
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
  } catch (error) {
    logError("registration_email.send_failed", error);
  }
}
