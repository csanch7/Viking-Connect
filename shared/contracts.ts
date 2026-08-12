export type UserType = "mentor" | "mentee";
export type UserStatus = "pending" | "approved" | "denied";
export type UserRole = "admin" | "user";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  linkedin: string;
  type: UserType;
  college: string | null;
  bio: string;
  areasOfExpertise: string[];
  gradYear: number;
  status: UserStatus;
  role: UserRole;
}


export type MentorDirectoryUser = Pick<
  PublicUser,
  | "id"
  | "name"
  | "email"
  | "linkedin"
  | "areasOfExpertise"
  | "type"
  | "gradYear"
>;

export type MenteeDirectoryUser = MentorDirectoryUser;

export interface MentorRecommendation {
  mentor: MentorDirectoryUser;
  recommendationScore: number;
  coveragePercentage: number;
  sharedTopicCount: number;
  matchedTopics: string[];
  sameCollege: boolean;
}

export interface MentorRecommendationsResponse {
  recommendations: MentorRecommendation[];
}

export type PendingUser = Omit<PublicUser, "status">;

export interface RegistrationRequest {
  name: string;
  password: string;
  email: string;
  linkedin: string;
  type: string;
  bio: string;
  college: string | null;
  areasOfExpertise: string[];
  gradYear: number;
}

export interface EmailRequest {
  sender: string;
  subject: string;
  body: string;
}

export interface SessionResponse {
  authenticated: boolean;
  admin: boolean;
  mentee: boolean;
}

export interface MessageResponse {
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function contractError(name: string): never {
  throw new Error(`Invalid API response: ${name}`);
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : contractError(key);
}

function readCollege(value: unknown): string | null {
  return typeof value === "string" || value === null
    ? value
    : contractError("college");
}

function readStringArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : contractError(key);
}

function readNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : contractError(key);
}

function parseUserType(value: unknown): UserType {
  return value === "mentor" || value === "mentee"
    ? value
    : contractError("type");
}

function parseUserRole(value: unknown): UserRole {
  return value === "admin" || value === "user" ? value : contractError("role");
}

function parseUserStatus(value: unknown): UserStatus {
  return value === "pending" || value === "approved" || value === "denied"
    ? value
    : contractError("status");
}

export function parseSessionResponse(value: unknown): SessionResponse {
  if (
    !isRecord(value) ||
    typeof value.authenticated !== "boolean" ||
    typeof value.admin !== "boolean" ||
    typeof value.mentee !== "boolean"
  ) {
    return contractError("session");
  }

  return {
    authenticated: value.authenticated,
    admin: value.admin,
    mentee: value.mentee,
  };
}

export function parseMessageResponse(value: unknown): MessageResponse {
  if (!isRecord(value)) {
    return contractError("message response");
  }

  return { message: readString(value, "message") };
}

export function parseTopicsEnvelope(value: unknown) {
  if (!isRecord(value)) {
    return contractError("topics envelope");
  }

  return { topics: readStringArray(value, "topics") };
}

export function parseTopicEnvelope(value: unknown) {
  if (!isRecord(value)) {
    return contractError("topic envelope");
  }

  return { topic: readString(value, "topic") };
}

export function parseCollegesEnvelope(value: unknown) {
  if (!isRecord(value)) {
    return contractError("colleges envelope");
  }

  return { colleges: readStringArray(value, "colleges") };
}

export function parsePublicUser(value: unknown): PublicUser {
  if (!isRecord(value)) {
    return contractError("user");
  }

  return {
    id: readString(value, "id"),
    name: readString(value, "name"),
    email: readString(value, "email"),
    linkedin: readString(value, "linkedin"),
    type: parseUserType(value.type),
    bio: readString(value, "bio"),
    areasOfExpertise: readStringArray(value, "areasOfExpertise"),
    gradYear: readNumber(value, "gradYear"),
    status: parseUserStatus(value.status),
    role: parseUserRole(value.role),
    college: readCollege(value.college),
  };
}

export function parseUserEnvelope(value: unknown) {
  if (!isRecord(value)) {
    return contractError("user envelope");
  }

  return { user: parsePublicUser(value.user) };
}

export function parseMentor(value: unknown): MentorDirectoryUser {
  if (!isRecord(value)) {
    return contractError("mentee");
  }

  const parsed: MentorDirectoryUser = {
    id: readString(value, "id"),
    name: readString(value, "name"),
    email: readString(value, "email"),
    linkedin: readString(value, "linkedin"),
    type: parseUserType(value.type),
    areasOfExpertise: readStringArray(value, "areasOfExpertise"),
    gradYear: readNumber(value, "gradYear"),
  };

  return parsed;
}

export function parseMentee(value: unknown): MenteeDirectoryUser {
  if (!isRecord(value)) {
    return contractError("mentor");
  }

  const parsed: MenteeDirectoryUser = {
    id: readString(value, "id"),
    name: readString(value, "name"),
    email: readString(value, "email"),
    linkedin: readString(value, "linkedin"),
    areasOfExpertise: readStringArray(value, "areasOfExpertise"),
    type: parseUserType(value.type),
    gradYear: readNumber(value, "gradYear"),
  };

  return parsed;
}

export function parseMentorList(value: unknown) {
  if (!Array.isArray(value)) {
    return contractError("mentor list");
  }

  return value.map(parseMentor);
}

export function parseMentorRecommendationsResponse(
  value: unknown,
): MentorRecommendationsResponse {
  if (!isRecord(value) || !Array.isArray(value.recommendations)) {
    return contractError("mentor recommendations");
  }

  return {
    recommendations: value.recommendations.map((recommendation) => {
      if (
        !isRecord(recommendation) ||
        typeof recommendation.sameCollege !== "boolean"
      ) {
        return contractError("mentor recommendation");
      }

      return {
        mentor: parseMentor(recommendation.mentor),
        recommendationScore: readNumber(recommendation, "recommendationScore"),
        coveragePercentage: readNumber(recommendation, "coveragePercentage"),
        sharedTopicCount: readNumber(recommendation, "sharedTopicCount"),
        matchedTopics: readStringArray(recommendation, "matchedTopics"),
        sameCollege: recommendation.sameCollege,
      };
    }),
  };
}

export function parseMenteeList(value: unknown) {
  if (!Array.isArray(value)) {
    return contractError("mentee list");
  }

  return value.map(parseMentee);
}

export function parsePendingUsersEnvelope(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.users)) {
    return contractError("pending users");
  }

  const users = value.users.map((user): PendingUser => {
    if (!isRecord(user)) {
      return contractError("pending user");
    }

    return {
      id: readString(user, "id"),
      name: readString(user, "name"),
      email: readString(user, "email"),
      linkedin: readString(user, "linkedin"),
      type: parseUserType(user.type),
      bio: readString(user, "bio"),
      areasOfExpertise: readStringArray(user, "areasOfExpertise"),
      gradYear: readNumber(user, "gradYear"),
      role: parseUserRole(user.role),
      college: readCollege(user.college),
    };
  });

  return { users };
}

export function parseCountResponse(value: unknown) {
  if (!isRecord(value)) {
    return contractError("count response");
  }

  const count = value.count;
  if (typeof count !== "string" && typeof count !== "number") {
    return contractError("count");
  }

  return { count: Number(count) };
}
