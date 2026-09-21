import {
  escapeHtml,
  renderButton,
  renderCallout,
  renderEmailLayout,
} from "./emailLayout";

function renderNextStep(title: string, description: string) {
  return `
    <tr>
      <td style="padding: 16px 0; border-top: 1px solid #e6e1d7;">
        <p style="margin: 0 0 4px; color: #191919; font-size: 15px; font-weight: 700; line-height: 1.4;">
          ${escapeHtml(title)}
        </p>
        <p style="margin: 0; color: #6b675f; font-size: 14px; line-height: 1.6;">
          ${escapeHtml(description)}
        </p>
      </td>
    </tr>
  `;
}

export function renderRegistrationAcceptanceEmail(loginUrl: string) {
  const nextSteps = [
    renderNextStep(
      "Complete your profile",
      "Review your bio, contact details, and mentorship topics so the right people can find you.",
    ),
    renderNextStep(
      "Explore the directory",
      "Search approved mentors and mentees by name, topic, and college.",
    ),
    renderNextStep(
      "Start a conversation",
      "When you find a helpful connection, reach out through their listed email or LinkedIn profile.",
    ),
  ].join("");

  const bodyHtml = `
    <p style="margin: 0 0 12px; color: #191919; font-size: 18px; font-weight: 700; line-height: 1.45;">
      Your account has been approved.
    </p>
    <p style="margin: 0 0 24px; color: #3b3b3b; font-size: 15px; line-height: 1.65;">
      You can now sign in to Viking Connect and begin building relationships across the St. Laurence community.
    </p>
    ${renderButton("Sign in to Viking Connect", loginUrl)}
    <h2 style="margin: 32px 0 8px; color: #191919; font-size: 18px; font-weight: 750; line-height: 1.35;">
      Make your first connection
    </h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      ${nextSteps}
    </table>
    ${renderCallout(
      "Viking Connect is a private community. Your profile and contact details are available only to approved members.",
    )}
    <p style="margin: 0; color: #6b675f; font-size: 13px; line-height: 1.6;">
      If the button does not open, copy and paste this address into your browser:<br>
      <a href="${escapeHtml(loginUrl)}" style="color: #191919; text-decoration: underline; text-decoration-color: #d7cfc2; word-break: break-all;">${escapeHtml(loginUrl)}</a>
    </p>
  `;

  return renderEmailLayout({
    title: "Your Viking Connect Account Is Approved",
    preheader: "Your Viking Connect account is approved. Sign in and make your first connection.",
    heading: "Welcome to Viking Connect",
    bodyHtml,
    footerHtml: "Viking Connect &middot; The St. Laurence mentorship community",
  });
}
