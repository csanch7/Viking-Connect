import type { User } from "../interfaces/userInterface";

export type RegistrationEmailUser = Omit<User, "password">;

const passwordSpecialCharacters = "!@#$%^&*()_-+=[{]};:,.?";
const earliestGraduationYear = 1961;
const latestGraduationYear = new Date().getFullYear() + 10;
const maxUsernameLength = 100;
const maxEmailLength = 254;
const maxHelpTextLength = 1000;
const maxExpertiseLength = 80;
const maxExpertiseCount = 15;
const validUserTypes = new Set(["mentor", "mentee"]);

export function isLinkedinProfileUrl(value: string) {
  return /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{3,100}\/?$/.test(
    value,
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
  return (
    value.length >= 12 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    [...value].some((character) =>
      passwordSpecialCharacters.includes(character),
    )
  );
}

export function normalizeRegistrationUser(input: User): RegistrationEmailUser {
  const areasOfExpertise = Array.isArray(input.areasOfExpertise)
    ? Array.from(
        new Set(
          input.areasOfExpertise
            .filter((area) => typeof area === "string")
            .map((area) => area.trim())
            .filter(Boolean),
        ),
      )
    : [];

  const type =
    typeof input.type === "string" ? input.type.trim().toLowerCase() : "";

  return {
    username: typeof input.username === "string" ? input.username.trim() : "",
    email: typeof input.email === "string" ? input.email.trim().toLowerCase() : "",
    linkedin: typeof input.linkedin === "string" ? input.linkedin.trim() : "",
    type,
    helpText:
      type === "mentee" && typeof input.helpText === "string"
        ? input.helpText.trim()
        : "",
    areasOfExpertise,
    gradYear: Number(input.gradYear),
  };
}

export function getRegistrationValidationError(
  user: RegistrationEmailUser,
  password: unknown,
) {
  if (!user.username || !password || !user.email || !user.type) {
    return "Missing required registration fields";
  }

  if (user.username.length > maxUsernameLength) {
    return "Name must be 100 characters or fewer";
  }

  if (typeof password !== "string" || !isStrongPassword(password)) {
    return "Password does not meet the requirements";
  }

  if (user.email.length > maxEmailLength || !isValidEmail(user.email)) {
    return "Enter a valid email address";
  }

  if (!validUserTypes.has(user.type)) {
    return "Choose mentor or mentee";
  }

  if (
    !Number.isInteger(user.gradYear) ||
    user.gradYear < earliestGraduationYear ||
    user.gradYear > latestGraduationYear
  ) {
    return "Select a valid graduation year";
  }

  if (!isLinkedinProfileUrl(user.linkedin)) {
    return "Enter a valid LinkedIn profile URL";
  }

  if (user.type === "mentor") {
    if (user.areasOfExpertise.length === 0) {
      return "Choose at least one area of expertise";
    }

    if (
      user.areasOfExpertise.length > maxExpertiseCount ||
      !user.areasOfExpertise.every((area) => area.length <= maxExpertiseLength)
    ) {
      return "Choose valid areas of expertise";
    }
  }

  if (user.type === "mentee") {
    if (!user.helpText) {
      return "Tell us what help you are looking for";
    }

    if (user.helpText.length > maxHelpTextLength) {
      return "Help text must be 1000 characters or fewer";
    }
  }

  return null;
}
