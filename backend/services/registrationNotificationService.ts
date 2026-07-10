import { Resend } from "resend";
import { env, getRegistrationEmailConfig } from "../config/env";
import { renderAdminRegistrationEmail } from "../emails/adminRegistrationEmail";
import type { RegistrationEmailUser } from "../validation/registrationValidation";

const adminPendingUsersPath = "/admin/pending-users";
const adminPendingUsersUrl = env.appUrl
  ? `${env.appUrl.replace(/\/$/, "")}${adminPendingUsersPath}`
  : adminPendingUsersPath;

function renderAdminRegistrationText(user: RegistrationEmailUser) {
  return `A new STL Mentor Program registration is waiting for review.

    Name: ${user.username}
    Email: ${user.email}
    Account type: ${user.type}
    Graduation year: ${user.gradYear}
    ${user.type === "mentor" ? "Areas of expertise" : "Help requested"}: ${
        user.type === "mentor"
          ? user.areasOfExpertise?.length
            ? user.areasOfExpertise.join(", ")
            : "Not provided"
          : user.helpText || "Not provided"
      }

    Review the registration at ${adminPendingUsersPath}.`;
}

export async function sendAdminRegistrationNotification(
  user: RegistrationEmailUser,
) {
  const config = getRegistrationEmailConfig();

  if (!config) {
    console.warn(
      "Registration email skipped; RESEND_API, FROM_RESEND_EMAIL, or TO_RESEND_EMAIL is missing",
    );
    return;
  }

  try {
    const resend = new Resend(config.apiKey);

    await resend.emails.send({
      from: config.from,
      to: config.to,
      subject: "STL Mentorship Program: New Registered User",
      html: renderAdminRegistrationEmail(
        user,
        adminPendingUsersUrl,
        adminPendingUsersPath,
      ),
      text: renderAdminRegistrationText(user),
    });
  } catch (error) {
    console.error("Unable to send registration email:", error);
  }
}
