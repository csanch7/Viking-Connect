declare module "express-session" {
  interface SessionData {
    userId: string;
    role: "user" | "admin" | "community member";
    type: "mentee" | "mentor";
  }
}

export {};
