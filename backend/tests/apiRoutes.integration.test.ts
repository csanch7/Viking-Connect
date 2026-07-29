import assert from "node:assert/strict";
import { describe, it } from "node:test";

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

const baseUser = {
  id: "7",
  name: "Jane Student",
  email: "jane@example.com",
  linkedin: "https://www.linkedin.com/in/jane-student",
  type: "mentee" as const,
  bio: "I am preparing for internships and early-career interviews.",
  areasOfExpertise: [],
  gradYear: 2027,
  status: "approved" as const,
  role: "user" as "admin" | "user",
};

const mentor = {
  id: "42",
  name: "Alex Mentor",
  email: "alex@example.com",
  linkedin: "https://www.linkedin.com/in/alex-mentor",
  areasOfExpertise: ["Finance"],
};

function buildApiApp(
  role: "admin" | "user" = "user",
  sendContactUsEmail: (
    request: import("../../shared/contracts").EmailRequest,
  ) => Promise<void> = async () => undefined,
) {
  const authenticatedUser = { ...baseUser, role };

  return createApp({
    sessionStore: new session.MemoryStore(),
    sessionSecret: "integration-test-secret",
    isProduction: false,
    apiDependencies: {
      readinessCheck: async () => undefined,
      contactDependencies: {
        sendContactUsEmail,
      },
      topicDependencies: {
        getTopics: async () => ["Career Planning", "Finance", "Technology"],
      },
      authDependencies: {
        findUserByEmail: async () => ({
          ...authenticatedUser,
          passwordHash: "stored-password-hash",
        }),
        findUserById: async () => authenticatedUser,
        verifyPassword: async () => true,
      },
      registrationDependencies: {
        getTopics: async () => ["Career Planning", "Finance", "Technology"],
        createUser: async (input) => ({
          id: "88",
          name: input.name,
          email: input.email,
          linkedin: input.linkedin,
          type: input.type,
          bio: input.bio,
          areasOfExpertise: input.areasOfExpertise,
          gradYear: input.gradYear,
          status: "pending",
          role: input.role,
          passwordHash: input.passwordHash,
        }),
        hashPassword: async () => "hashed-password",
        isUniqueViolation: () => false,
        sendAdminRegistrationNotification: async () => undefined,
      },
      profileDependencies: {
        getTopics: async () => ["Career Planning", "Finance", "Technology"],
        updateBio: async (bio) => ({ bio }),
        updateAreasOfExpertise: async (areasOfExpertise) => ({
          areasOfExpertise,
        }),
      },
      passwordResetDependencies: {
        createPasswordResetSecret: () => ({
          token: "reset-secret",
          tokenHash: "reset-secret-hash",
        }),
        hashPasswordResetToken: () => "reset-secret-hash",
        createPasswordResetToken: async (email) => ({ email }),
        consumePasswordResetToken: async () => ({ id: "7" }),
        hashPassword: async () => "new-password-hash",
        sendPasswordResetEmail: async () => undefined,
      },
      mentorDependencies: {
        getMentorsByPagination: async () => [mentor],
        findMentorById: async (id) =>
          id === mentor.id
            ? {
                ...baseUser,
                ...mentor,
                type: "mentor",
                gradYear: 2012,
              }
            : undefined,
      },
      adminDependencies: {
        getPendingUsers: async () => [
          {
            id: "19",
            name: "Pat Mentor",
            email: "pat@example.com",
            linkedin: "https://www.linkedin.com/in/pat-mentor",
            type: "mentor",
            bio: "I mentor students interested in technology careers.",
            areasOfExpertise: ["Technology"],
            gradYear: 2008,
            role: "user",
          },
        ],
        approveUser: async (id) => ({ id }),
        denyUser: async (id) => ({ id }),
        getMentorCount: async () => ({ count: "12" }),
        getMenteeCount: async () => ({ count: "34" }),
      },
    },
  });
}

async function login(app: ReturnType<typeof buildApiApp>) {
  const agent = request.agent(app);
  const response = await agent.post("/api/auth/login").send({
    email: baseUser.email,
    password: "StrongPass123!",
  });
  assert.equal(response.status, 200);
  return agent;
}

describe("API routes", () => {
  it("serves the public health endpoint", async () => {
    const response = await request(buildApiApp()).get("/api/health");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });

    const readiness = await request(buildApiApp()).get("/api/ready");
    assert.equal(readiness.status, 200);
    assert.deepEqual(readiness.body, { status: "ready" });
  });

  it("serves topics for public registration forms", async () => {
    const response = await request(buildApiApp()).get("/api/topics");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      topics: ["Career Planning", "Finance", "Technology"],
    });
  });

  it("validates and sends contact form submissions", async () => {
    let received: import("../../shared/contracts").EmailRequest | undefined;
    const app = buildApiApp("user", async (emailRequest) => {
      received = emailRequest;
    });

    const response = await request(app).post("/api/contact-us").send({
      sender: "  Visitor@Example.com ",
      subject: " Mentorship question ",
      body: " I would like to learn more about the program. ",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "Message sent successfully",
    });
    assert.deepEqual(received, {
      sender: "visitor@example.com",
      subject: "Mentorship question",
      body: "I would like to learn more about the program.",
    });
  });

  it("rejects invalid contact form submissions", async () => {
    let sendCount = 0;
    const app = buildApiApp("user", async () => {
      sendCount += 1;
    });

    const response = await request(app).post("/api/contact-us").send({
      sender: "not-an-email",
      subject: "",
      body: "",
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      message: "Enter a valid email address",
    });
    assert.equal(sendCount, 0);
  });

  it("limits contact form submissions independently", async () => {
    const app = buildApiApp();
    const payload = {
      sender: "visitor@example.com",
      subject: "Mentorship question",
      body: "I would like to learn more about the program.",
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request(app).post("/api/contact-us").send(payload);
      assert.equal(response.status, 200);
    }

    const limitedResponse = await request(app)
      .post("/api/contact-us")
      .send(payload);

    assert.equal(limitedResponse.status, 429);
    assert.deepEqual(limitedResponse.body, {
      message: "Too many messages; please try again later",
    });
  });

  it("registers a valid mentor through the HTTP API", async () => {
    const response = await request(buildApiApp())
      .post("/api/register")
      .send({
        name: "Alex Mentor",
        password: "StrongPass123!",
        email: "alex@example.com",
        linkedin: "https://www.linkedin.com/in/alex-mentor",
        type: "mentor",
        bio: "I help students prepare for careers in finance.",
        areasOfExpertise: ["Finance"],
        gradYear: 2012,
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.message, "User created");
    assert.equal(response.body.user.status, "pending");
    assert.equal("passwordHash" in response.body.user, false);
  });

  it("updates only the authenticated member's profile", async () => {
    const agent = await login(buildApiApp());

    const update = await agent.patch("/api/change-bio/7").send({
      bio: "I am looking for resume review and interview preparation.",
    });
    assert.equal(update.status, 200);
    assert.equal(
      update.body.bio,
      "I am looking for resume review and interview preparation.",
    );

    const forbidden = await agent.patch("/api/change-bio/8").send({
      bio: "Attempted change",
    });
    assert.equal(forbidden.status, 403);
  });

  it("returns mentor search results and individual profiles", async () => {
    const agent = await login(buildApiApp());

    const directory = await agent.get(
      "/api/mentors/0?filter=Finance&searchText=Alex",
    );
    assert.equal(directory.status, 200);
    assert.equal(directory.body[0].name, "Alex Mentor");

    const profile = await agent.get("/api/mentor/42");
    assert.equal(profile.status, 200);
    assert.equal(profile.body.id, "42");
  });

  it("allows admins to review and approve pending users", async () => {
    const agent = await login(buildApiApp("admin"));

    const pending = await agent.get("/api/admin/pending-users");
    assert.equal(pending.status, 200);
    assert.equal(pending.body.users[0].name, "Pat Mentor");

    const approval = await agent.post("/api/admin/approve-user/19");
    assert.equal(approval.status, 200);
    assert.deepEqual(approval.body, { message: "19 has been approved" });
  });

  it("blocks non-admin members from admin routes", async () => {
    const agent = await login(buildApiApp());
    const response = await agent.get("/api/admin/pending-users");

    assert.equal(response.status, 403);
    assert.deepEqual(response.body, { message: "Forbidden" });
  });
});
