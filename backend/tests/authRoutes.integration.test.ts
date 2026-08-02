import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import type { DatabaseUserWithPassword } from "../repositories/userRepository";

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://test:test@localhost/test";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET ?? "integration-test-secret";
process.env.NODE_ENV = "test";

const [{ createApp }, { default: session }, { default: request }] =
  await Promise.all([
    import("../app"),
    import("express-session"),
    import("supertest"),
  ]);

const approvedUser: DatabaseUserWithPassword = {
  id: "7",
  name: "Jane Student",
  email: "jane@example.com",
  linkedin: "https://www.linkedin.com/in/jane-student",
  type: "mentee",
  bio: "I am preparing for internships and early-career interviews.",
  areasOfExpertise: [],
  gradYear: 2027,
  status: "approved",
  role: "user" as const,
  passwordHash: "stored-password-hash",
};

let userForEmail: typeof approvedUser | undefined;

function buildTestApp() {
  return createApp({
    sessionStore: new session.MemoryStore(),
    sessionSecret: "integration-test-secret",
    isProduction: false,
    apiDependencies: {
      authDependencies: {
        findUserByEmail: async () => userForEmail,
        findUserById: async (id) => {
          if (id !== approvedUser.id) {
            return undefined;
          }

          const { passwordHash: _passwordHash, ...user } = approvedUser;
          return user;
        },
        verifyPassword: async (_hash, password) =>
          password === "StrongPass123!",
      },
    },
  });
}

describe("authentication routes", () => {
  beforeEach(() => {
    userForEmail = approvedUser;
  });

  it("rejects malformed and invalid login attempts", async () => {
    const app = buildTestApp();

    const missingCredentials = await request(app)
      .post("/api/auth/login")
      .send({});
    assert.equal(missingCredentials.status, 400);
    assert.deepEqual(missingCredentials.body, {
      message: "Email and password are required",
    });

    userForEmail = undefined;
    const unknownUser = await request(app).post("/api/auth/login").send({
      email: "unknown@example.com",
      password: "StrongPass123!",
    });
    assert.equal(unknownUser.status, 401);
    assert.deepEqual(unknownUser.body, {
      message: "Invalid email or password",
    });
  });

  it("prevents pending and denied accounts from signing in", async () => {
    const app = buildTestApp();

    for (const [status, message] of [
      ["pending", "Account pending approval"],
      ["denied", "Account was not approved"],
    ] as const) {
      userForEmail = { ...approvedUser, status };
      const response = await request(app).post("/api/auth/login").send({
        email: approvedUser.email,
        password: "StrongPass123!",
      });

      assert.equal(response.status, 403);
      assert.deepEqual(response.body, { message });
    }
  });

  it("creates a session and returns the authenticated member", async () => {
    const app = buildTestApp();
    const agent = request.agent(app);

    const login = await agent.post("/api/auth/login").send({
      email: approvedUser.email,
      password: "StrongPass123!",
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.message, "Logged in");
    assert.equal(login.body.user.id, approvedUser.id);
    assert.ok(login.headers["set-cookie"]);

    const sessionResponse = await agent.get("/api/auth/session");
    assert.deepEqual(sessionResponse.body, {
      authenticated: true,
      admin: false,
      mentee: true,
    });

    const me = await agent.get("/api/auth/me");
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, approvedUser.email);
    assert.equal("passwordHash" in me.body.user, false);
  });

  it("protects member routes without an authenticated session", async () => {
    const response = await request(buildTestApp()).get("/api/auth/me");

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { message: "Not authenticated" });
  });

  it("destroys the authenticated session during logout", async () => {
    const agent = request.agent(buildTestApp());
    await agent.post("/api/auth/login").send({
      email: approvedUser.email,
      password: "StrongPass123!",
    });

    const logout = await agent.post("/api/auth/logout");
    assert.equal(logout.status, 200);
    assert.deepEqual(logout.body, { message: "Logged out" });

    const sessionResponse = await agent.get("/api/auth/session");
    assert.deepEqual(sessionResponse.body, {
      authenticated: false,
      admin: false,
      mentee: false,
    });
  });
});
