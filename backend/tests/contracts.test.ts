import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseMentorList,
  parseMentorRecommendationsResponse,
  parsePublicUser,
  parseSessionResponse,
  parseActiveTopicsEnvelope,
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
    assert.equal(
      parseMentorList([
        {
          id: "43",
          name: "Casey Community",
          email: "casey@example.com",
          linkedin: "https://www.linkedin.com/in/casey-community",
          type: "mentor",
          areasOfExpertise: ["Finance"],
          gradYear: null,
        },
      ])[0].gradYear,
      null,
    );
    assert.deepEqual(parseActiveTopicsEnvelope({ topics: ["Finance"] }), {
      topics: ["Finance"],
    });
    assert.deepEqual(
      parseTopicsEnvelope({
        topics: [{ id: "2", name: "Finance", is_active: false }],
      }),
      { topics: [{ id: "2", name: "Finance", is_active: false }] },
    );
    assert.deepEqual(
      parseTopicEnvelope({
        topic: { id: "4", name: "Leadership", is_active: true },
      }),
      { topic: { id: "4", name: "Leadership", is_active: true } },
    );
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
      () => parseTopicsEnvelope({ topics: [null] }),
      /Invalid API response: topics/,
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
