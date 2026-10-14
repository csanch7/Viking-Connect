import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost/viking_connect_test";

const { loadEnv } = await import("../config/env");

const productionEnvironment = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://example.test/viking_connect",
  SESSION_SECRET: "a-production-session-secret-that-is-long-enough",
  APP_URL: "https://www.vikingconnect.org",
  AWS_REGION: "us-east-1",
  SES_FROM_EMAIL: "mail@vikingconnect.org",
  ADMIN_NOTIFICATION_EMAIL: "admin@example.com, reviewer@example.com",
  CONTACT_EMAIL: "contact@example.com",
};

describe("environment configuration", () => {
  it("loads and normalizes complete production configuration", () => {
    const configuration = loadEnv(productionEnvironment);

    assert.equal(configuration.appUrl, "https://www.vikingconnect.org");
    assert.deepEqual(configuration.adminNotificationEmail, [
      "admin@example.com",
      "reviewer@example.com",
    ]);
    assert.deepEqual(configuration.contactEmail, ["contact@example.com"]);
  });

  it("requires production URL and email settings", () => {
    for (const name of [
      "APP_URL",
      "AWS_REGION",
      "SES_FROM_EMAIL",
      "ADMIN_NOTIFICATION_EMAIL",
      "CONTACT_EMAIL",
    ]) {
      assert.throws(
        () => loadEnv({ ...productionEnvironment, [name]: undefined }),
        new RegExp(`${name} is required`),
      );
    }
  });

  it("requires a canonical HTTPS production origin", () => {
    for (const appUrl of [
      "http://www.vikingconnect.org",
      "https://www.vikingconnect.org/login",
      "not-a-url",
    ]) {
      assert.throws(() =>
        loadEnv({ ...productionEnvironment, APP_URL: appUrl }),
      );
    }
  });

  it("rejects invalid email addresses and weak session secrets", () => {
    assert.throws(() =>
      loadEnv({
        ...productionEnvironment,
        ADMIN_NOTIFICATION_EMAIL: "not-an-email",
      }),
    );
    assert.throws(() =>
      loadEnv({ ...productionEnvironment, SESSION_SECRET: "too-short" }),
    );
  });

  it("keeps email delivery optional outside production", () => {
    const configuration = loadEnv({
      DATABASE_URL: "postgresql://localhost/viking_connect",
    });

    assert.equal(configuration.appUrl, undefined);
    assert.equal(configuration.sesFromEmail, undefined);
    assert.equal(configuration.sessionSecret, "development-only-change-me");
  });
});
