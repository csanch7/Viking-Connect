import type { User } from "../interfaces/userInterface";

export type RegistrationEmailUser = Omit<User, "password">;

const passwordSpecialCharacters = "!@#$%^&*()_-+=[{]};:,.?";
const earliestGraduationYear = 1961;
const latestGraduationYear = new Date().getFullYear() + 10;
const maxNameLength = 100;
const maxEmailLength = 254;
const maxBioLength = 1000;
const maxExpertiseLength = 80;
const maxExpertiseCount = 15;
const validUserTypes = new Set(["mentor", "mentee"]);

export function isLinkedinProfileUrl(value: string) {
  return /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{3,100}\/?$/.test(
    value,
  );
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isStrongPassword(value: string) {
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
    name: typeof input.name === "string" ? input.name.trim() : "",
    email:
      typeof input.email === "string" ? input.email.trim().toLowerCase() : "",
    linkedin: typeof input.linkedin === "string" ? input.linkedin.trim() : "",
    type,
    bio: typeof input.bio === "string" ? input.bio.trim() : "",
    college:
      typeof input.college === "string" ? input.college.trim() || null : null,
    areasOfExpertise,
    gradYear: Number(input.gradYear),
  };
}

export function getRegistrationValidationError(
  user: RegistrationEmailUser,
  password: unknown,
) {
  if (!user.name || !password || !user.email || !user.type) {
    return "Missing required registration fields";
  }

  if (user.name.length > maxNameLength) {
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

  if (!user.bio) {
    return "Tell us about yourself";
  }

  if (user.bio.length > maxBioLength) {
    return "Bio must be 1000 characters or fewer";
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

  if (user.areasOfExpertise.length === 0) {
    return user.type === "mentor"
      ? "Choose at least one area of expertise"
      : "Choose at least one area of interest";
  }

  if (
    user.areasOfExpertise.length > maxExpertiseCount ||
    !user.areasOfExpertise.every((area) => area.length <= maxExpertiseLength)
  ) {
    return "Choose valid topics";
  }

  return null;
}
