import { Resend } from "resend";
import type { EmailRequest } from "../../shared/contracts";
import { getContactUsEmailConfig } from "../config/env";
import { log, logError } from "./logger";

function renderContactUsText(emailData: EmailRequest) {
  return [
    "Contact Us Submission",
    "",
    `Sender: ${emailData.sender}`,
    "",
    emailData.body,
  ].join("\n");
}

export async function sendContactUsEmail(emailData: EmailRequest) {
  const config = getContactUsEmailConfig();

  if (!config) {
    log("warn", "contact_email.missing_config");
    throw new Error("Contact email is not configured");
  }

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to: config.to,
      replyTo: emailData.sender,
      subject: emailData.subject,
      text: renderContactUsText(emailData),
    });

    if (result.error) {
      throw result.error;
    }
  } catch (error) {
    logError("contact_email.send_failed", error);
    throw error;
  }
}
