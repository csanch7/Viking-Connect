const maxSearchTextLength = 100;
const maxFilterCount = 25;
const maxFilterLength = 80;

export function normalizeIdParam(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getIdParamValidationError(value: string) {
  if (!/^\d+$/.test(value)) {
    return "Invalid user id";
  }

  return null;
}

export function normalizePageParam(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const page = Number(value);

  if (!Number.isSafeInteger(page)) {
    return null;
  }

  return page;
}

export function normalizeSearchText(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export function getSearchTextValidationError(value: string | undefined) {
  if (value && value.length > maxSearchTextLength) {
    return "Search text must be 100 characters or fewer";
  }

  return null;
}

export function normalizeFilterQuery(value: unknown) {
  const filters =
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value.map(String)
        : [];

  return Array.from(
    new Set(filters.map((filter) => filter.trim()).filter(Boolean)),
  );
}

export function getFilterValidationError(filters: string[]) {
  if (
    filters.length > maxFilterCount ||
    !filters.every((filter) => filter.length <= maxFilterLength)
  ) {
    return "Choose valid filters";
  }

  return null;
}
