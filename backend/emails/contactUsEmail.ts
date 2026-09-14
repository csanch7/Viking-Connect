import type { EmailRequest } from "../../shared/contracts";
import {
  escapeHtml,
  renderButton,
  renderCallout,
  renderEmailLayout,
  renderField,
  renderLink,
} from "./emailLayout";

export function renderContactUsEmail(emailData: EmailRequest) {
  const sender = escapeHtml(emailData.sender);
  const subject = escapeHtml(emailData.subject);
  const message = escapeHtml(emailData.body).replace(/\r?\n/g, "<br>");

  const fields = [
    renderField("From", renderLink(`mailto:${emailData.sender}`, sender)),
    renderField("Subject", subject),
  ].join("");

  const bodyHtml = `
    <p style="margin: 0 0 24px; color: #4f4b45; font-size: 15px; line-height: 1.6;">
      Someone reached out through the mentorship program website. Replying to this email will respond directly to the sender.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      ${fields}
    </table>
    ${renderCallout(message)}
    ${renderButton("Reply to sender", `mailto:${emailData.sender}`)}
  `;

  return renderEmailLayout({
    title: "New Contact Form Message",
    preheader: "A new message was submitted through the STL Mentor Program website.",
    heading: "New contact form message",
    bodyHtml,
    footerHtml: "Sent from the contact form on the STL Mentor Program website.",
  });
}
