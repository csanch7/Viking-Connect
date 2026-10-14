import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request } from "express";
import {
  getApiRateLimitKey,
  getApiRateLimitLimit,
  getAuthRateLimitKey,
  getContactRateLimitKey,
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

  it("gives anonymous school traffic more room than signed-in members", () => {
    assert.equal(
      getApiRateLimitLimit(requestWith({ ip: "192.0.2.10" })),
      500,
    );
    assert.equal(
      getApiRateLimitLimit(
        requestWith({ ip: "192.0.2.10", userId: "student-1" }),
      ),
      100,
    );
  });
});

describe("contact rate-limit keys", () => {
  it("gives different senders on the same IP independent limits", () => {
    const firstSender = getContactRateLimitKey({
      ...requestWith({ ip: "192.0.2.10" }),
      body: { sender: "first@example.com" },
    } as Request);
    const secondSender = getContactRateLimitKey({
      ...requestWith({ ip: "192.0.2.10" }),
      body: { sender: "second@example.com" },
    } as Request);

    assert.equal(
      firstSender,
      "ip-sender:192.0.2.10:first@example.com",
    );
    assert.equal(
      secondSender,
      "ip-sender:192.0.2.10:second@example.com",
    );
    assert.notEqual(firstSender, secondSender);
  });

  it("normalizes equivalent sender addresses", () => {
    assert.equal(
      getContactRateLimitKey({
        ...requestWith({ ip: "192.0.2.10" }),
        body: { sender: " Visitor@Example.com " },
      } as Request),
      getContactRateLimitKey({
        ...requestWith({ ip: "192.0.2.10" }),
        body: { sender: "visitor@example.com" },
      } as Request),
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
