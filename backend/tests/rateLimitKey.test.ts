import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request } from "express";
import {
  getApiRateLimitKey,
  getAuthRateLimitKey,
} from "../middleware/rateLimitKey";

function requestWith(options: {
  ip: string;
  userId?: string;
  email?: unknown;
}): Request {
  return {
    ip: options.ip,
    body: options.email === undefined ? {} : { email: options.email },
    session: {
      userId: options.userId,
    },
  } as Request;
}

describe("API rate-limit keys", () => {
  it("uses the authenticated account instead of a shared IP address", () => {
    const firstStudent = getApiRateLimitKey(
      requestWith({ ip: "192.0.2.10", userId: "student-1" }),
    );
    const secondStudent = getApiRateLimitKey(
      requestWith({ ip: "192.0.2.10", userId: "student-2" }),
    );

    assert.equal(firstStudent, "user:student-1");
    assert.equal(secondStudent, "user:student-2");
    assert.notEqual(firstStudent, secondStudent);
  });

  it("uses a normalized IP key for anonymous requests", () => {
    assert.equal(
      getApiRateLimitKey(requestWith({ ip: "192.0.2.10" })),
      "ip:192.0.2.10",
    );
  });
});

describe("authentication rate-limit keys", () => {
  it("gives different students on the same IP independent attempt limits", () => {
    const firstStudent = getAuthRateLimitKey(
      requestWith({ ip: "192.0.2.10", email: "first@example.com" }),
    );
    const secondStudent = getAuthRateLimitKey(
      requestWith({ ip: "192.0.2.10", email: "second@example.com" }),
    );

    assert.equal(firstStudent, "ip-email:192.0.2.10:first@example.com");
    assert.equal(secondStudent, "ip-email:192.0.2.10:second@example.com");
    assert.notEqual(firstStudent, secondStudent);
  });

  it("normalizes equivalent email addresses to the same key", () => {
    assert.equal(
      getAuthRateLimitKey(
        requestWith({ ip: "192.0.2.10", email: " Student@Example.com " }),
      ),
      getAuthRateLimitKey(
        requestWith({ ip: "192.0.2.10", email: "student@example.com" }),
      ),
    );
  });

  it("falls back to the IP for requests without an email", () => {
    assert.equal(
      getAuthRateLimitKey(requestWith({ ip: "192.0.2.10" })),
      "ip:192.0.2.10",
    );
  });
});
