import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseMentorList,
  parseMentorRecommendationsResponse,
  parsePublicUser,
  parseSessionResponse,
  parseTopicEnvelope,
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
          gradYear: 2012,
        },
      ])[0].id,
      "42",
    );
    assert.deepEqual(parseTopicsEnvelope({ topics: ["Finance"] }), {
      topics: ["Finance"],
    });
    assert.deepEqual(parseTopicEnvelope({ topic: "Leadership" }), {
      topic: "Leadership",
    });
    assert.deepEqual(
      parseMentorRecommendationsResponse({
        recommendations: [
          {
            mentor: {
              id: "42",
              name: "Alex Mentor",
              email: "alex@example.com",
              linkedin: "https://www.linkedin.com/in/alex-mentor",
              type: "mentor",
              areasOfExpertise: ["Career Planning", "Finance"],
              gradYear: 2012,
            },
            recommendationScore: 60,
            coveragePercentage: 50,
            sharedTopicCount: 2,
            matchedTopics: ["Career Planning", "Finance"],
            sameCollege: true,
          },
        ],
      }).recommendations[0],
      {
        mentor: {
          id: "42",
          name: "Alex Mentor",
          email: "alex@example.com",
          linkedin: "https://www.linkedin.com/in/alex-mentor",
          type: "mentor",
          areasOfExpertise: ["Career Planning", "Finance"],
          gradYear: 2012,
        },
        recommendationScore: 60,
        coveragePercentage: 50,
        sharedTopicCount: 2,
        matchedTopics: ["Career Planning", "Finance"],
        sameCollege: true,
      },
    );
  });

  it("rejects contract drift at runtime", () => {
    assert.throws(
      () => parseSessionResponse({ authenticated: "yes", admin: false }),
      /Invalid API response/,
    );
    assert.throws(
      () =>
        parseMentorList([
          {
            id: "42",
            name: "Alex Mentor",
            email: "alex@example.com",
            linkedin: "https://www.linkedin.com/in/alex-mentor",
            type: "mentor",
            areasOfExpertise: ["Finance"],
          },
        ]),
      /Invalid API response: gradYear/,
    );
    assert.throws(
      () =>
        parseMentorRecommendationsResponse({
          recommendations: [{ recommendationScore: "high" }],
        }),
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
