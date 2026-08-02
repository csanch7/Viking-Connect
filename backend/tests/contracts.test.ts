import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseMentorList,
  parsePublicUser,
  parseSessionResponse,
  parseTopicsEnvelope,
} from "../../shared/contracts";

describe("shared API contracts", () => {
  it("parses valid session and mentor responses", () => {
    assert.deepEqual(
      parseSessionResponse({ authenticated: true, admin: false, mentee: true }),
      { authenticated: true, admin: false, mentee: true },
    );
    assert.equal(
      parseMentorList([
        {
          id: "42",
          name: "Alex Mentor",
          email: "alex@example.com",
          linkedin: "https://www.linkedin.com/in/alex-mentor",
          type: "mentor",
          areasOfExpertise: ["Finance"],
        },
      ])[0].id,
      "42",
    );
    assert.deepEqual(parseTopicsEnvelope({ topics: ["Finance"] }), {
      topics: ["Finance"],
    });
  });

  it("rejects contract drift at runtime", () => {
    assert.throws(
      () => parseSessionResponse({ authenticated: "yes", admin: false }),
      /Invalid API response/,
    );
    assert.throws(
      () =>
        parsePublicUser({
          id: "7",
          name: "Jane",
          email: "jane@example.com",
        }),
      /Invalid API response/,
    );
  });
});
