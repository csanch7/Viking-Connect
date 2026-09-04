import type { RegistrationEmailUser } from "../validation/registrationValidation";

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
    ? `<a href="${linkedinValue}" style="color: #090909; text-decoration: underline; text-decoration-color: #ffc72c;">${linkedinValue}</a>`
    : linkedinValue;

  const linkedinRow = user.linkedin
    ? `
      <tr>
        <td style="padding: 12px 0; color: #676767; font-size: 14px; vertical-align: top;">LinkedIn</td>
        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">
          ${linkedinContent}
        </td>
      </tr>
    `
    : "";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Registration Pending Review</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f7f5ef; color: #090909; font-family: Arial, Helvetica, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          A new STL Mentor Program registration is waiting for admin approval.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f7f5ef; margin: 0; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border: 1px solid #dedbd2; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: #090909; padding: 28px 32px;">
                    <p style="margin: 0 0 8px; color: #ffc72c; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">STL Mentor Program</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 800;">New registration pending review</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 24px; color: #3b3b3b; font-size: 16px; line-height: 1.6;">
                      A new user created an account and is waiting for an administrator to approve or deny access.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-top: 1px solid #dedbd2; border-bottom: 1px solid #dedbd2;">
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Name</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(user.name)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Email</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">
                          <a href="mailto:${escapeHtml(user.email)}" style="color: #090909; text-decoration: underline; text-decoration-color: #ffc72c;">${escapeHtml(user.email)}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Account type</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(user.type)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">${user.gradYear ? "Graduation Year": "Role"}</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(user.gradYear ? user.gradYear: user.role)}</td>
                      </tr>
                      ${linkedinRow}
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px; vertical-align: top;">Bio</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; line-height: 1.5; text-align: right;">${escapeHtml(user.bio || "Not provided")}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px; vertical-align: top;">${topicsLabel}</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; line-height: 1.5; text-align: right;">${expertiseValue}</td>
                      </tr>
                    </table>
                    <div style="margin: 24px 0; padding: 18px 20px; background: #fff5d2; border-left: 4px solid #ffc72c;">
                      <p style="margin: 0; color: #090909; font-size: 14px; line-height: 1.6;">
                        Review this registration in the admin pending users queue.
                      </p>
                    </div>
                    <a href="${escapeHtml(adminPendingUsersUrl)}" style="display: inline-block; padding: 13px 18px; background: #ffc72c; border-radius: 6px; color: #090909; font-size: 14px; font-weight: 800; text-decoration: none;">
                      Open pending users
                    </a>
                    <p style="margin: 18px 0 0; color: #676767; font-size: 13px; line-height: 1.5;">
                      If the button does not open, visit ${escapeHtml(adminPendingUsersPath)} after signing in as an admin.
                    </p>
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
