import type { EmailRequest } from "../../shared/contracts";
import { isValidEmail } from "./registrationValidation";

const maxEmailLength = 254;
const maxSubjectLength = 120;
const maxBodyLength = 5_000;

export function normalizeContactRequest(value: unknown): EmailRequest {
  const request =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    sender:
      typeof request.sender === "string"
        ? request.sender.trim().toLowerCase()
        : "",
    subject: typeof request.subject === "string" ? request.subject.trim() : "",
    body: typeof request.body === "string" ? request.body.trim() : "",
  };
}

export function getContactValidationError(request: EmailRequest) {
  if (request.sender.length > maxEmailLength || !isValidEmail(request.sender)) {
    return "Enter a valid email address";
  }

  if (
    !request.subject ||
    request.subject.length > maxSubjectLength ||
    /[\r\n]/.test(request.subject)
  ) {
    return "Enter a subject of 120 characters or fewer";
  }

  if (!request.body || request.body.length > maxBodyLength) {
    return "Enter a message of 5,000 characters or fewer";
  }

  return null;
}
