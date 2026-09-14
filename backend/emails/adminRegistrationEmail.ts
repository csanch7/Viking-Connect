import type { RegistrationEmailUser } from "../validation/registrationValidation";
import {
  escapeHtml,
  isHttpUrl,
  renderButton,
  renderCallout,
  renderEmailLayout,
  renderField,
  renderLink,
} from "./emailLayout";

function formatAccountType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function renderAdminRegistrationEmail(
  user: RegistrationEmailUser,
  adminPendingUsersUrl: string,
  adminPendingUsersPath: string,
) {
  const expertiseValue = user.areasOfExpertise?.length
    ? user.areasOfExpertise.map((area) => escapeHtml(area)).join(", ")
    : "Not provided";
  const topicsLabel =
    user.type === "mentor" ? "Areas of expertise / Industries" : "Areas of interest";

  const linkedinValue = escapeHtml(user.linkedin);
  const linkedinContent = isHttpUrl(user.linkedin)
    ? renderLink(user.linkedin, linkedinValue)
    : linkedinValue;

  const fields = [
    renderField("Name", escapeHtml(user.name)),
    renderField(
      "Email",
      renderLink(`mailto:${user.email}`, escapeHtml(user.email)),
    ),
    renderField("Account type", formatAccountType(user.type)),
    renderField(
      user.gradYear ? "Graduation year" : "Role",
      escapeHtml(user.gradYear ? user.gradYear : user.role),
    ),
    user.linkedin ? renderField("LinkedIn", linkedinContent) : "",
    renderField("Bio", escapeHtml(user.bio || "Not provided")),
    renderField(topicsLabel, expertiseValue),
  ].join("");

  const bodyHtml = `
    <p style="margin: 0 0 24px; color: #3b3b3b; font-size: 15px; line-height: 1.6;">
      A new user created an account and is waiting for an administrator to approve or deny access.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      ${fields}
    </table>
    ${renderCallout("Review this registration in the admin pending users queue.")}
    ${renderButton("Open pending users", adminPendingUsersUrl)}
    <p style="margin: 18px 0 0; color: #6b675f; font-size: 13px; line-height: 1.5;">
      If the button does not open, visit ${escapeHtml(adminPendingUsersPath)} after signing in as an admin.
    </p>
  `;

  return renderEmailLayout({
    title: "New Registration Pending Review",
    preheader: "A new STL Mentor Program registration is waiting for admin approval.",
    heading: "New registration pending review",
    bodyHtml,
  });
}
