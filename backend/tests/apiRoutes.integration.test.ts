import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UserRole } from "../../shared/contracts";

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
  college: null,
  bio: "I am preparing for internships and early-career interviews.",
  areasOfExpertise: [],
  gradYear: 2027,
  status: "approved" as const,
  role: "user" as UserRole,
};

const mentor = {
  id: "42",
  name: "Alex Mentor",
  email: "alex@example.com",
  linkedin: "https://www.linkedin.com/in/alex-mentor",
  type: "mentor" as const,
  areasOfExpertise: ["Finance"],
  gradYear: 2012,
};

const mentorRecommendation = {
  mentor,
  recommendationScore: 60,
  coveragePercentage: 50,
  sharedTopicCount: 2,
  matchedTopics: ["Career Planning", "Finance"],
  sameCollege: true,
};

const mentee = {
  ...baseUser,
  id: "77",
  name: "Jordan Mentee",
  email: "jordan@example.com",
  linkedin: "https://www.linkedin.com/in/jordan-mentee",
  areasOfExpertise: ["Career Planning"],
};

const menteeRecommendation = {
  mentee,
  recommendationScore: 80,
  coveragePercentage: 100,
  sharedTopicCount: 1,
  matchedTopics: ["Career Planning"],
  sameCollege: true,
};

const matchActionEntry = {
  member: mentor,
  action: "contacted" as const,
  actedAt: "2026-10-13T12:00:00.000Z",
};

let receivedMentorQuery:
  | {
      page: number;
      filters: string[];
      searchText: string | undefined;
      college: string | undefined;
    }
  | undefined;

let receivedMenteeQuery:
  | {
      page: number;
      filters: string[];
      searchText: string | undefined;
      collegeFilter: string | undefined;
    }
  | undefined;

let receivedTopic: string | undefined;
let receivedCollegeSearch: string | undefined;

function buildApiApp(
  role: UserRole = "user",
  sendContactUsEmail: (
    request: import("../../shared/contracts").EmailRequest,
  ) => Promise<void> = async () => undefined,
  type: "mentor" | "mentee" = "mentee",
  addTopicResult?: import("../../shared/contracts").Topic | null,
) {
  const authenticatedUser = { ...baseUser, role, type };

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
        getActiveTopics: async () => [
          "Career Planning",
          "Finance",
          "Technology",
        ],
        getTopics: async () => [
          { id: "1", name: "Career Planning", is_active: true },
          { id: "2", name: "Finance", is_active: false },
          { id: "3", name: "Technology", is_active: true },
        ],
        addTopic: async (topic) => {
          receivedTopic = topic;
          return addTopicResult === undefined
            ? { id: "4", name: topic, is_active: true }
            : addTopicResult;
        },
        changeTopicActivity: async () => false,
      },
      collegeDependencies: {
        getColleges: async (searchText) => {
          receivedCollegeSearch = searchText;
          return ["DePaul University", "University of Illinois Chicago"];
        },
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
        getColleges: async () => [
          "DePaul University",
          "University of Illinois Chicago",
        ],
        createUser: async (input) => ({
          id: "88",
          name: input.name,
          email: input.email,
          linkedin: input.linkedin,
          type: input.type,
          college: input.college,
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
        findCollegeByName: async (college) =>
          ["DePaul University", "University of Illinois Chicago"].includes(
            college,
          )
            ? { id: college === "DePaul University" ? "1" : "2", name: college }
            : undefined,
        updateBio: async (bio) => ({ bio }),
        updateCollege: async (college) => ({ college }),
        updateProfile: async (profile) => ({
          type: profile.type,
          bio: profile.bio,
          college:
            profile.collegeId === "1"
              ? "DePaul University"
              : profile.collegeId === "2"
                ? "University of Illinois Chicago"
                : null,
          areasOfExpertise: profile.areasOfExpertise,
        }),
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
        getMentorsByPagination: async (page, filters, searchText, college) => {
          receivedMentorQuery = {
            page,
            filters: filters ?? [],
            searchText,
            college,
          };
          return [mentor];
        },
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
      recommendationDependencies: {
        getMentorRecommendations: async () => [mentorRecommendation],
        getMenteeRecommendations: async () => [menteeRecommendation],
      },
      matchActionDependencies: {
        getMatchActions: async () => [matchActionEntry],
        getMatchAction: async () => ({
          action: "contacted",
          actedAt: matchActionEntry.actedAt,
        }),
        setMatchAction: async (_actorId, _actorType, _memberId, action) => ({
          action,
          actedAt: matchActionEntry.actedAt,
        }),
        deleteMatchAction: async () => undefined,
      },
      menteeDependencies: {
        getMenteesByPagination: async (
          page,
          filters,
          searchText,
          collegeFilter,
        ) => {
          receivedMenteeQuery = {
            page,
            filters: filters ?? [],
            searchText,
            collegeFilter,
          };
          return [mentee];
        },
        findMenteeById: async (id) => (id === mentee.id ? mentee : undefined),
      },
      adminDependencies: {
        getPendingUsers: async () => [
          {
            id: "19",
            name: "Pat Mentor",
            email: "pat@example.com",
            linkedin: "https://www.linkedin.com/in/pat-mentor",
            type: "mentor",
            college: "DePaul University",
            bio: "I mentor students interested in technology careers.",
            areasOfExpertise: ["Technology"],
            gradYear: 2008,
            role: "user",
          },
        ],
        approveUser: async (id) => ({ email: baseUser.email }),
        deleteUser: async (id) =>
          id === mentor.id ? { name: mentor.name } : undefined,
        denyUser: async (id) => ({ id }),
        getMentorCount: async () => ({ count: "12" }),
        getMenteeCount: async () => ({ count: "34" }),
        sendRegistrationAcceptanceEmail: async () => undefined,
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
    const response = await request(buildApiApp()).get("/api/active-topics");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      topics: ["Career Planning", "Finance", "Technology"],
    });
    assert.equal(response.headers["cache-control"], "no-store");
  });

  it("serves the full topic inventory only to admins", async () => {
    const unauthorizedResponse =
      await request(buildApiApp()).get("/api/topics");
    assert.equal(unauthorizedResponse.status, 403);

    const agent = await login(buildApiApp("admin"));
    const response = await agent.get("/api/topics");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      topics: [
        { id: "1", name: "Career Planning", is_active: true },
        { id: "2", name: "Finance", is_active: false },
        { id: "3", name: "Technology", is_active: true },
      ],
    });
    assert.equal(response.headers["cache-control"], "no-store");
  });

  it("allows an admin to add a trimmed topic", async () => {
    receivedTopic = undefined;
    const agent = await login(buildApiApp("admin"));

    const response = await agent
      .post("/api/topics")
      .send({ topic: "  Leadership  " });

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, {
      topic: { id: "4", name: "Leadership", is_active: true },
    });
    assert.equal(receivedTopic, "Leadership");
  });

  it("reports a conflict when a topic already exists", async () => {
    const agent = await login(buildApiApp("admin", undefined, "mentee", null));

    const response = await agent
      .post("/api/topics")
      .send({ topic: "leadership" });

    assert.equal(response.status, 409);
    assert.deepEqual(response.body, { message: "Topic already exists" });
  });

  it("rejects invalid and unauthorized topic creation", async () => {
    const unauthorizedResponse = await request(buildApiApp("admin"))
      .post("/api/topics")
      .send({ topic: "Leadership" });
    assert.equal(unauthorizedResponse.status, 403);

    const agent = await login(buildApiApp("admin"));
    const invalidResponse = await agent
      .post("/api/topics")
      .send({ topic: "   " });
    assert.equal(invalidResponse.status, 400);
  });

  it("serves colleges for registration and profile forms", async () => {
    receivedCollegeSearch = undefined;
    const response = await request(buildApiApp()).get("/api/colleges");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      colleges: ["DePaul University", "University of Illinois Chicago"],
    });
    assert.equal(response.headers["cache-control"], "public, max-age=300");
    assert.equal(receivedCollegeSearch, undefined);
  });

  it("normalizes college searches before querying", async () => {
    receivedCollegeSearch = undefined;
    const response = await request(buildApiApp())
      .get("/api/colleges")
      .query({ searchText: "  Illinois  " });

    assert.equal(response.status, 200);
    assert.equal(receivedCollegeSearch, "Illinois");
  });

  it("validates and sends contact form submissions", async () => {
    let received: import("../../shared/contracts").EmailRequest | undefined;
    const app = buildApiApp("user", async (emailRequest) => {
      received = emailRequest;
    });

    const response = await request(app).post("/api/contact-us").send({
      sender: "  Visitor@Example.com ",
      body: " I would like to learn more about the program. ",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "Message sent successfully",
    });
    assert.deepEqual(received, {
      sender: "visitor@example.com",
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
      message: "Too many messages from this email; please try again later",
    });
  });

  it("does not share contact limits between senders on one school IP", async () => {
    const app = buildApiApp();

    for (let senderNumber = 0; senderNumber < 6; senderNumber += 1) {
      const response = await request(app).post("/api/contact-us").send({
        sender: `visitor-${senderNumber}@example.com`,
        body: "I would like to learn more about the program.",
      });
      assert.equal(response.status, 200);
    }
  });

  it("retains a broader contact spam ceiling for one network", async () => {
    const app = buildApiApp();

    for (let senderNumber = 0; senderNumber < 50; senderNumber += 1) {
      const response = await request(app).post("/api/contact-us").send({
        sender: `bulk-${senderNumber}@example.com`,
        body: "I would like to learn more about the program.",
      });
      assert.equal(response.status, 200);
    }

    const limitedResponse = await request(app).post("/api/contact-us").send({
      sender: "bulk-final@example.com",
      body: "I would like to learn more about the program.",
    });

    assert.equal(limitedResponse.status, 429);
    assert.deepEqual(limitedResponse.body, {
      message: "Too many messages from this network; please try again later",
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
        college: "DePaul University",
        bio: "I help students prepare for careers in finance.",
        areasOfExpertise: ["Finance"],
        gradYear: 2012,
        role: "user",
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.message, "User created");
    assert.equal(response.body.user.status, "pending");
    assert.equal(response.body.user.college, "DePaul University");
    assert.equal("passwordHash" in response.body.user, false);
  });

  it("registers a community member without a graduation year", async () => {
    const response = await request(buildApiApp())
      .post("/api/register")
      .send({
        name: "Casey Community",
        password: "StrongPass123!",
        email: "casey@example.com",
        linkedin: "https://www.linkedin.com/in/casey-community",
        type: "mentor",
        college: null,
        bio: "I support students through the local community.",
        areasOfExpertise: ["Finance"],
        gradYear: null,
        role: "community member",
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.gradYear, null);
    assert.equal(response.body.user.role, "community member");
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

    const collegeUpdate = await agent.patch("/api/change-college/7").send({
      college: "University of Illinois Chicago",
    });
    assert.equal(collegeUpdate.status, 200);
    assert.equal(collegeUpdate.body.college, "University of Illinois Chicago");

    const invalidCollege = await agent.patch("/api/change-college/7").send({
      college: "Not a listed college",
    });
    assert.equal(invalidCollege.status, 400);

    const malformedCollege = await agent.patch("/api/change-college/7").send({
      college: 42,
    });
    assert.equal(malformedCollege.status, 400);

    const profileUpdate = await agent.patch("/api/profile/7").send({
      type: "mentor",
      bio: "I am looking for career planning and interview preparation.",
      college: "University of Illinois Chicago",
      areasOfExpertise: ["Career Planning", "Finance"],
    });
    assert.equal(profileUpdate.status, 200);
    assert.deepEqual(profileUpdate.body, {
      message: "Profile has been successfully updated",
      type: "mentor",
      bio: "I am looking for career planning and interview preparation.",
      college: "University of Illinois Chicago",
      areasOfExpertise: ["Career Planning", "Finance"],
    });

    const updatedSession = await agent.get("/api/auth/session");
    assert.equal(updatedSession.status, 200);
    assert.equal(updatedSession.body.mentee, false);

    const invalidType = await agent.patch("/api/profile/7").send({
      type: "admin",
      bio: "I am looking for career planning and interview preparation.",
      college: "University of Illinois Chicago",
      areasOfExpertise: ["Career Planning"],
    });
    assert.equal(invalidType.status, 400);
    assert.deepEqual(invalidType.body, { message: "Choose mentor or mentee" });

    const forbiddenProfileUpdate = await agent.patch("/api/profile/8").send({
      bio: "Attempted change",
      college: null,
      areasOfExpertise: ["Finance"],
    });
    assert.equal(forbiddenProfileUpdate.status, 403);
  });

  it("returns mentor search results and individual profiles", async () => {
    const agent = await login(buildApiApp());

    const directory = await agent.get(
      "/api/mentors/0?filter=Finance&searchText=Alex&college=DePaul%20University",
    );
    assert.equal(directory.status, 200);
    assert.equal(directory.body[0].name, "Alex Mentor");
    assert.equal(directory.body[0].gradYear, 2012);
    assert.deepEqual(receivedMentorQuery, {
      page: 0,
      filters: ["Finance"],
      searchText: "Alex",
      college: "DePaul University",
    });

    const invalidCollege = await agent.get(
      "/api/mentors/0?college=DePaul&college=UIC",
    );
    assert.equal(invalidCollege.status, 400);
    assert.deepEqual(invalidCollege.body, {
      message: "Choose a valid college",
    });

    const profile = await agent.get("/api/mentor/42");
    assert.equal(profile.status, 200);
    assert.equal(profile.body.id, "42");
  });

  it("returns personalized mentor recommendations to mentees", async () => {
    const agent = await login(buildApiApp());

    const response = await agent.get("/api/recommendations/mentors");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      recommendations: [mentorRecommendation],
    });
  });

  it("does not expose mentee recommendations to mentors", async () => {
    const app = buildApiApp("user", async () => undefined, "mentor");
    const agent = await login(app);

    const response = await agent.get("/api/recommendations/mentors");

    assert.equal(response.status, 403);
    assert.deepEqual(response.body, {
      message: "Mentor recommendations are available to mentees",
    });
  });

  it("returns personalized mentee recommendations to mentors", async () => {
    const app = buildApiApp("user", async () => undefined, "mentor");
    const agent = await login(app);

    const response = await agent.get("/api/recommendations/mentees");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      recommendations: [menteeRecommendation],
    });
  });

  it("does not expose mentor-facing recommendations to mentees", async () => {
    const agent = await login(buildApiApp());

    const response = await agent.get("/api/recommendations/mentees");

    assert.equal(response.status, 403);
    assert.deepEqual(response.body, {
      message: "Mentee recommendations are available to mentors",
    });
  });

  it("stores and returns private match actions", async () => {
    const agent = await login(buildApiApp());

    const list = await agent.get("/api/match-actions?action=contacted&page=0");
    assert.equal(list.status, 200);
    assert.deepEqual(list.body, {
      entries: [matchActionEntry],
      hasNextPage: false,
    });

    const status = await agent.get("/api/match-actions/42");
    assert.equal(status.status, 200);
    assert.equal(status.body.action, "contacted");

    const saved = await agent
      .put("/api/match-actions/42")
      .send({ action: "dismissed" });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.action, "dismissed");

    const removed = await agent.delete("/api/match-actions/42");
    assert.equal(removed.status, 204);
  });

  it("validates match action requests", async () => {
    const agent = await login(buildApiApp());

    assert.equal(
      (await agent.get("/api/match-actions?action=unknown")).status,
      400,
    );
    assert.equal(
      (await agent.put("/api/match-actions/42").send({ action: "connected" }))
        .status,
      400,
    );
    assert.equal((await agent.get("/api/match-actions/not-an-id")).status, 400);
  });

  it("returns mentee search results and profiles to mentees", async () => {
    const agent = await login(buildApiApp());

    const directory = await agent.get(
      "/api/mentees/0?filter=Career%20Planning&searchText=Jordan&collegeFilter=DePaul%20University",
    );
    assert.equal(directory.status, 200);
    assert.equal(directory.body[0].name, mentee.name);
    assert.equal(directory.body[0].gradYear, 2027);
    assert.deepEqual(receivedMenteeQuery, {
      page: 0,
      filters: ["Career Planning"],
      searchText: "Jordan",
      collegeFilter: "DePaul University",
    });

    const invalidCollege = await agent.get(
      "/api/mentees/0?collegeFilter=DePaul&collegeFilter=UIC",
    );
    assert.equal(invalidCollege.status, 400);
    assert.deepEqual(invalidCollege.body, {
      message: "Choose a valid college",
    });

    const profile = await agent.get(`/api/mentee/${mentee.id}`);
    assert.equal(profile.status, 200);
    assert.equal(profile.body.id, mentee.id);
  });

  it("allows mentors to browse mentees and open their profiles", async () => {
    const app = buildApiApp("user", async () => undefined, "mentor");
    const agent = await login(app);

    const directory = await agent.get("/api/mentees/0");
    assert.equal(directory.status, 200);
    assert.equal(directory.body[0].name, mentee.name);

    const profile = await agent.get(`/api/mentee/${mentee.id}`);
    assert.equal(profile.status, 200);
    assert.equal(profile.body.id, mentee.id);
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

  it("allows admins to delete a user", async () => {
    const agent = await login(buildApiApp("admin"));

    const deletion = await agent.delete(`/api/admin/users/${mentor.id}`);

    assert.equal(deletion.status, 200);
    assert.deepEqual(deletion.body, {
      message: `${mentor.name} has been deleted`,
    });
  });

  it("rejects self-deletion and missing users", async () => {
    const agent = await login(buildApiApp("admin"));

    const selfDeletion = await agent.delete(`/api/admin/users/${baseUser.id}`);
    assert.equal(selfDeletion.status, 400);
    assert.deepEqual(selfDeletion.body, {
      message: "You cannot delete your own account",
    });

    const missingUser = await agent.delete("/api/admin/users/999");
    assert.equal(missingUser.status, 404);
    assert.deepEqual(missingUser.body, { message: "User not found" });

    const invalidUser = await agent.delete("/api/admin/users/not-a-user-id");
    assert.equal(invalidUser.status, 400);
  });

  it("blocks non-admin members from admin routes", async () => {
    const agent = await login(buildApiApp());
    const response = await agent.get("/api/admin/pending-users");

    assert.equal(response.status, 403);
    assert.deepEqual(response.body, { message: "Forbidden" });

    const deletion = await agent.delete(`/api/admin/users/${mentor.id}`);
    assert.equal(deletion.status, 403);
    assert.deepEqual(deletion.body, { message: "Forbidden" });
  });
});
