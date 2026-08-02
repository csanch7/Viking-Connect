declare module "express-session" {
  interface SessionData {
    userId: string;
    role: "user" | "admin";
    type: "mentee" | "mentor";
  }
}

export {};
