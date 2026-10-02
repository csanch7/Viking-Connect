import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLoginValidationError,
  normalizeLoginCredentials,
} from "../validation/authValidation";
import {
  getExpertiseListValidationError,
  getBioValidationError,
  normalizeExpertiseList,
  normalizeBio,
  normalizeUserType,
} from "../validation/profileValidation";
import {
  getCollegeFilterValidationError,
  getFilterValidationError,
  getIdParamValidationError,
  getSearchTextValidationError,
  normalizeFilterQuery,
  normalizeCollegeFilter,
  normalizeIdParam,
  normalizePageParam,
  normalizeSearchText,
} from "../validation/routeValidation";

describe("login validation", () => {
  it("normalizes credentials without trimming passwords", () => {
    assert.deepEqual(
      normalizeLoginCredentials({
        email: "  JANE@example.com ",
        password: " password with spaces ",
      }),
      {
        email: "JANE@example.com",
        password: " password with spaces ",
      },
    );
  });

  it("rejects missing and oversized credentials", () => {
    assert.equal(
      getLoginValidationError({ email: "", password: "password" }),
      "Email and password are required",
    );
    assert.equal(
      getLoginValidationError({
        email: `${"a".repeat(255)}@x.com`,
        password: "password",
      }),
      "Email or password is too long",
    );
  });
});

describe("profile validation", () => {
  it("accepts only mentor and mentee profile types", () => {
    assert.equal(normalizeUserType("mentor"), "mentor");
    assert.equal(normalizeUserType("mentee"), "mentee");
    assert.equal(normalizeUserType("admin"), null);
  });

  it("trims bios and rejects empty or oversized text", () => {
    assert.equal(normalizeBio("  Career guidance  "), "Career guidance");
    assert.equal(getBioValidationError(""), "Bio is required");
    assert.equal(
      getBioValidationError("x".repeat(1001)),
      "Bio must be 1000 characters or fewer",
    );
  });

  it("normalizes expertise into a unique non-empty list", () => {
    assert.deepEqual(
      normalizeExpertiseList([" Finance ", "Finance", "", 42, null]),
      ["Finance"],
    );
    assert.deepEqual(normalizeExpertiseList("Finance"), []);
  });

  it("rejects empty, excessive, and oversized expertise lists", () => {
    assert.equal(
      getExpertiseListValidationError([]),
      "Choose at least one area of expertise",
    );
    assert.equal(
      getExpertiseListValidationError(
        Array.from({ length: 16 }, (_, i) => `Area ${i}`),
      ),
      "Choose valid areas of expertise",
    );
    assert.equal(
      getExpertiseListValidationError(["x".repeat(81)]),
      "Choose valid areas of expertise",
    );
  });
});

describe("route validation", () => {
  it("accepts numeric IDs and safe zero-based page numbers", () => {
    assert.equal(normalizeIdParam(" 42 "), "42");
    assert.equal(getIdParamValidationError("42"), null);
    assert.equal(normalizePageParam("0"), 0);
    assert.equal(normalizePageParam("12"), 12);
  });

  it("rejects malformed IDs and page numbers", () => {
    assert.equal(getIdParamValidationError("1 OR 1=1"), "Invalid user id");
    assert.equal(normalizePageParam("-1"), null);
    assert.equal(normalizePageParam("1.5"), null);
    assert.equal(normalizePageParam("9007199254740992"), null);
  });

  it("normalizes filters and validates query length limits", () => {
    assert.deepEqual(normalizeFilterQuery([" Finance ", "Finance", "Tech"]), [
      "Finance",
      "Tech",
    ]);
    assert.equal(
      getFilterValidationError(["x".repeat(81)]),
      "Choose valid filters",
    );
    assert.equal(normalizeSearchText("  Jane  "), "Jane");
    assert.equal(
      getSearchTextValidationError("x".repeat(101)),
      "Search text must be 100 characters or fewer",
    );
    assert.equal(
      normalizeCollegeFilter("  DePaul University  "),
      "DePaul University",
    );
    assert.equal(getCollegeFilterValidationError(undefined), null);
    assert.equal(
      getCollegeFilterValidationError(["DePaul University"]),
      "Choose a valid college",
    );
    assert.equal(
      getCollegeFilterValidationError("x".repeat(101)),
      "Choose a valid college",
    );
  });
});
