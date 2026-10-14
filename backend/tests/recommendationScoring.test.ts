import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://test:test@localhost/test";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET ?? "recommendation-test-secret";
process.env.NODE_ENV = "test";

const { qualifiesAsRecommendation } =
  await import("../repositories/recommendationRepository");

describe("recommendation quality threshold", () => {
  it("accepts college-only, meaningful coverage, and topic-depth matches", () => {
    assert.equal(
      qualifiesAsRecommendation({
        coveragePercentage: 0,
        sharedTopicCount: 0,
        sameCollege: true,
      }),
      true,
    );
    assert.equal(
      qualifiesAsRecommendation({
        coveragePercentage: 25,
        sharedTopicCount: 1,
        sameCollege: false,
      }),
      true,
    );
    assert.equal(
      qualifiesAsRecommendation({
        coveragePercentage: 14,
        sharedTopicCount: 2,
        sameCollege: false,
      }),
      true,
    );
  });

  it("rejects a weak one-topic match without a college connection", () => {
    assert.equal(
      qualifiesAsRecommendation({
        coveragePercentage: 20,
        sharedTopicCount: 1,
        sameCollege: false,
      }),
      false,
    );
  });
});
