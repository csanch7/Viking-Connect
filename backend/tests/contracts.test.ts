import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseMentorList,
  parseMentorRecommendationsResponse,
  parseMenteeRecommendationsResponse,
  parseMatchActionListResponse,
  parseMatchActionStatus,
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
    assert.deepEqual(
      parseMenteeRecommendationsResponse({
        recommendations: [
          {
            mentee: {
              id: "77",
              name: "Jordan Mentee",
              email: "jordan@example.com",
              linkedin: "https://www.linkedin.com/in/jordan-mentee",
              type: "mentee",
              areasOfExpertise: ["Career Planning"],
              gradYear: 2027,
            },
            recommendationScore: 80,
            coveragePercentage: 100,
            sharedTopicCount: 1,
            matchedTopics: ["Career Planning"],
            sameCollege: true,
          },
        ],
      }).recommendations[0].mentee.name,
      "Jordan Mentee",
    );
    assert.deepEqual(
      parseMatchActionStatus({
        action: "contacted",
        actedAt: "2026-10-13T12:00:00.000Z",
      }),
      {
        action: "contacted",
        actedAt: "2026-10-13T12:00:00.000Z",
      },
    );
    assert.deepEqual(parseMatchActionStatus({ action: null, actedAt: null }), {
      action: null,
      actedAt: null,
    });
    assert.equal(
      parseMatchActionListResponse({
        entries: [
          {
            member: {
              id: "77",
              name: "Jordan Mentee",
              email: "jordan@example.com",
              linkedin: "https://www.linkedin.com/in/jordan-mentee",
              type: "mentee",
              areasOfExpertise: ["Career Planning"],
              gradYear: 2027,
            },
            action: "dismissed",
            actedAt: "2026-10-13T12:00:00.000Z",
          },
        ],
        hasNextPage: false,
      }).entries[0].action,
      "dismissed",
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
        parseMenteeRecommendationsResponse({
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
