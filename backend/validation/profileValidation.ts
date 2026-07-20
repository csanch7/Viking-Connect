const maxBioLength = 1000;
const maxExpertiseLength = 80;
const maxExpertiseCount = 15;

export function normalizeBio(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getBioValidationError(bio: string) {
  if (!bio) {
    return "Bio is required";
  }

  if (bio.length > maxBioLength) {
    return "Bio must be 1000 characters or fewer";
  }

  return null;
}

export function normalizeExpertiseList(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .filter((area) => typeof area === "string")
            .map((area) => area.trim())
            .filter(Boolean),
        ),
      )
    : [];
}

export function getExpertiseListValidationError(areasOfExpertise: string[]) {
  if (areasOfExpertise.length === 0) {
    return "Choose at least one area of expertise";
  }

  if (
    areasOfExpertise.length > maxExpertiseCount ||
    !areasOfExpertise.every((area) => area.length <= maxExpertiseLength)
  ) {
    return "Choose valid areas of expertise";
  }

  return null;
}
