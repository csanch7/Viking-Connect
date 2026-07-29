import type { EmailRequest } from "../../shared/contracts";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderContactUsEmail(emailData: EmailRequest) {
  const sender = escapeHtml(emailData.sender);
  const subject = escapeHtml(emailData.subject);
  const message = escapeHtml(emailData.body).replace(/\r?\n/g, "<br>");

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Contact Form Message</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f7f5ef; color: #191919; font-family: Arial, Helvetica, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          A new message was submitted through the STL Mentor Program website.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; background: #f7f5ef; margin: 0; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; overflow: hidden; border: 1px solid #dedbd2; border-radius: 8px; background: #ffffff;">
                <tr>
                  <td style="padding: 28px 32px; background: #090909;">
                    <p style="margin: 0 0 8px; color: #ffc72c; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">
                      STL Mentor Program
                    </p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.25;">
                      New contact form message
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 24px; color: #4f4b45; font-size: 16px; line-height: 1.6;">
                      Someone reached out through the mentorship program website. Replying to this email will respond directly to the sender.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; border-top: 1px solid #dedbd2; border-bottom: 1px solid #dedbd2;">
                      <tr>
                        <td style="width: 90px; padding: 14px 0; color: #6b675f; font-size: 14px; vertical-align: top;">
                          From
                        </td>
                        <td style="padding: 14px 0; color: #191919; font-size: 14px; font-weight: 700; line-height: 1.5; text-align: right; word-break: break-word;">
                          <a href="mailto:${sender}" style="color: #191919; text-decoration: underline; text-decoration-color: #ffc72c;">${sender}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="width: 90px; padding: 14px 0; border-top: 1px solid #ebe7df; color: #6b675f; font-size: 14px; vertical-align: top;">
                          Subject
                        </td>
                        <td style="padding: 14px 0; border-top: 1px solid #ebe7df; color: #191919; font-size: 14px; font-weight: 700; line-height: 1.5; text-align: right; word-break: break-word;">
                          ${subject}
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 8px; color: #806a35; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;">
                      Message
                    </p>
                    <div style="padding: 20px; border-left: 4px solid #ffc72c; background: #fff8e2;">
                      <p style="margin: 0; color: #292724; font-size: 15px; line-height: 1.7; overflow-wrap: anywhere;">
                        ${message}
                      </p>
                    </div>

                    <a href="mailto:${sender}" style="display: inline-block; margin-top: 24px; padding: 13px 18px; border-radius: 6px; color: #090909; font-size: 14px; font-weight: 800; text-decoration: none; background: #ffc72c;">
                      Reply to sender
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 32px; border-top: 1px solid #dedbd2; color: #777168; font-size: 12px; line-height: 1.5; background: #fbfaf7;">
                    Sent from the contact form on the STL Mentor Program website.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
