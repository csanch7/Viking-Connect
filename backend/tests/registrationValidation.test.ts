import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { User } from "../interfaces/userInterface";
import {
  getRegistrationValidationError,
  isLinkedinProfileUrl,
  normalizeRegistrationUser,
} from "../validation/registrationValidation";

const validPassword = "StrongPass123!";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    name: "Jane Mentor",
    password: validPassword,
    email: "jane@example.com",
    linkedin: "https://www.linkedin.com/in/jane-mentor",
    type: "mentor",
    bio: "I help students prepare for careers in technology.",
    areasOfExpertise: ["Software Engineering"],
    gradYear: 2020,
    ...overrides,
  };
}

function validate(user: User) {
  const normalizedUser = normalizeRegistrationUser(user);
  return getRegistrationValidationError(normalizedUser, user.password);
}

describe("registration validation", () => {
  it("accepts valid mentor and mentee registrations", () => {
    assert.equal(validate(makeUser()), null);
    assert.equal(
      validate(
        makeUser({
          type: "mentee",
          areasOfExpertise: ["Interview Preparation"],
          bio: "I am looking for guidance with interview preparation.",
        }),
      ),
      null,
    );
  });

  it("normalizes strings, email casing, type, and expertise", () => {
    const normalized = normalizeRegistrationUser(
      makeUser({
        name: "  Jane Mentor  ",
        email: "  JANE@EXAMPLE.COM  ",
        type: " MENTOR ",
        areasOfExpertise: [
          " Software Engineering ",
          "Software Engineering",
          "",
        ],
      }),
    );

    assert.equal(normalized.name, "Jane Mentor");
    assert.equal(normalized.email, "jane@example.com");
    assert.equal(normalized.type, "mentor");
    assert.deepEqual(normalized.areasOfExpertise, ["Software Engineering"]);
  });

  it("requires every password strength category", () => {
    const weakPasswords = [
      "Short1!",
      "lowercase123!",
      "UPPERCASE123!",
      "NoNumbersHere!",
      "NoSpecial1234",
    ];

    for (const password of weakPasswords) {
      assert.equal(
        validate(makeUser({ password })),
        "Password does not meet the requirements",
      );
    }
  });

  it("rejects malformed email and LinkedIn URLs", () => {
    assert.equal(
      validate(makeUser({ email: "not-an-email" })),
      "Enter a valid email address",
    );
    assert.equal(
      validate(makeUser({ linkedin: "https://example.com/jane" })),
      "Enter a valid LinkedIn profile URL",
    );
    assert.equal(
      isLinkedinProfileUrl("https://linkedin.com/in/jane-mentor"),
      true,
    );
    assert.equal(
      isLinkedinProfileUrl("http://linkedin.com/in/jane-mentor"),
      false,
    );
  });

  it("enforces role-specific profile fields", () => {
    assert.equal(
      validate(makeUser({ areasOfExpertise: [] })),
      "Choose at least one area of expertise",
    );
    assert.equal(
      validate(
        makeUser({ type: "mentee", areasOfExpertise: [], bio: "" }),
      ),
      "Tell us about yourself",
    );
    assert.equal(
      validate(makeUser({ type: "mentee", areasOfExpertise: [] })),
      "Choose at least one area of interest",
    );
  });

  it("rejects unsupported roles and graduation years", () => {
    assert.equal(
      validate(makeUser({ type: "administrator" })),
      "Choose mentor or mentee",
    );
    assert.equal(
      validate(makeUser({ gradYear: 1960 })),
      "Select a valid graduation year",
    );
    assert.equal(
      validate(makeUser({ gradYear: new Date().getFullYear() + 11 })),
      "Select a valid graduation year",
    );
  });
});
