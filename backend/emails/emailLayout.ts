export function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function isHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const colors = {
  ink: "#090909",
  inkBody: "#191919",
  textMuted: "#6b675f",
  gold: "#ffc72c",
  surfaceSoft: "#f7f5ef",
  surfaceCard: "#ffffff",
  surfaceMuted: "#f7f3eb",
  border: "#e6e1d7",
};

export function renderField(label: string, valueHtml: string) {
  return `
    <tr>
      <td style="padding: 14px 0; border-top: 1px solid ${colors.border};">
        <p style="margin: 0 0 4px; color: ${colors.textMuted}; font-size: 13px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase;">${label}</p>
        <p style="margin: 0; color: ${colors.inkBody}; font-size: 15px; font-weight: 600; line-height: 1.5; word-break: break-word;">${valueHtml}</p>
      </td>
    </tr>
  `;
}

export function renderCallout(bodyHtml: string) {
  return `
    <div style="margin: 24px 0; padding: 16px 18px; background: ${colors.surfaceMuted}; border: 1px solid ${colors.border}; border-radius: 6px;">
      <p style="margin: 0; color: ${colors.inkBody}; font-size: 15px; line-height: 1.6;">${bodyHtml}</p>
    </div>
  `;
}

export function renderButton(label: string, href: string) {
  return `
    <a href="${escapeHtml(href)}" style="display: inline-block; padding: 13px 20px; background: ${colors.gold}; border-radius: 6px; color: ${colors.ink}; font-size: 13px; font-weight: 800; text-decoration: none;">
      ${escapeHtml(label)}
    </a>
  `;
}

export function renderLink(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="color: ${colors.inkBody}; text-decoration: underline; text-decoration-color: ${colors.border};">${label}</a>`;
}

export function renderEmailLayout(options: {
  title: string;
  preheader: string;
  heading: string;
  bodyHtml: string;
  footerHtml?: string;
}) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(options.title)}</title>
      </head>
      <body style="margin: 0; padding: 0; background: ${colors.surfaceSoft}; color: ${colors.inkBody}; font-family: Arial, Helvetica, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          ${escapeHtml(options.preheader)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; background: ${colors.surfaceSoft}; margin: 0; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background: ${colors.surfaceCard}; border: 1px solid ${colors.border}; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 28px 32px; background: ${colors.ink};">
                    <h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 760; line-height: 1.2;">${escapeHtml(options.heading)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    ${options.bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 32px; border-top: 1px solid ${colors.border}; color: ${colors.textMuted}; font-size: 13px; line-height: 1.5; background: ${colors.surfaceMuted};">
                    ${options.footerHtml ?? "STL Mentor Program &middot; This is an automated notification."}
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
