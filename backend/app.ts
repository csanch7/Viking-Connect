import express from "express";
import { rateLimit } from "express-rate-limit";
import { Request, Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { User } from "./interfaces/userInterface";
import { hashPassword, verifyPassword } from "./services/passwordService";
import {
  createUser,
  findUserByEmail,
  findUserById,
  isUniqueViolation,
  getPendingUsers,
  denyUser,
  approveUser,
  getMentorsByPagination,
} from "./database";

import session from "express-session";
import pgSession from "connect-pg-simple";
import { requireAdmin, requireAuth } from "./middleware/auth";

const app = express();
const PgSession = pgSession(session);
const databaseUrl = process.env.DATABASE_URL!;
const sessionSecret =
  process.env.SESSION_SECRET ?? "development-only-change-me";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist");

app.set("trust proxy", 1);

if (!process.env.SESSION_SECRET) {
  console.warn("SESSION_SECRET is not set; using a development-only secret");
}

app.use(
  session({
    store: new PgSession({
      conString: databaseUrl,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,               // 100 requests per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests; please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts; please try again later" },
});
app.use("/api", apiLimiter);

app.get("/api/health", async (req: Request, res: Response) => {
  res.send("STL Mentor API");
});

app.post("/api/register", authLimiter, async (req: Request<{}, {}, User>, res: Response) => {
  const { password, ...user } = req.body;

  if (!user.username || !password || !user.email || !user.type) {
    res.status(400).json({ message: "Missing required registration fields" });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const createdUser = await createUser({
      ...user,
      role: "user",
      passwordHash,
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        linkedin: createdUser.linkedin,
        type: createdUser.type,
        helpText: createdUser.helpText,
        aoeList: createdUser.aoeList,
        gradYear: createdUser.gradYear,
        status: createdUser.status,
        role: createdUser.role,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res
        .status(409)
        .json({ message: "A user with that email or username already exists" });
      return;
    }

    console.error("Unable to create user:", error);
    res.status(500).json({ message: "Unable to create user" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const validPassword = await verifyPassword(user.passwordHash, password);

    if (!validPassword) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (user.status !== "approved") {
      res.status(403).json({ message: "Account pending approval" });
      return;
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({
      message: "Logged in",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        type: user.type,
      },
    });
  } catch (error) {
    console.error("Unable to log in:", error);
    res.status(500).json({ message: "Unable to log in" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

app.get("/api/auth/session", (req, res) => {
  res.json({ authenticated: Boolean(req.session.userId),
             admin: Boolean(req.session.role === "admin")
   });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const userId: string = req.session.userId ?? "";

  const user = await findUserById(userId);

  res.json({ user });
});

app.get("/api/admin/pending-users", requireAdmin, async (req, res) => {

  const users = await getPendingUsers();

  res.json({ users });
});

app.post("/api/admin/deny-user/:userId", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const deniedUser = await denyUser(userId)

  if (!deniedUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ message: `${userId} has been denied` });

  
});

app.get("/api/mentors/:pagniator", requireAuth, async (req, res) => {
  const { pagniator } = req.params;
  let page : number = Number(pagniator);
  const users = await getMentorsByPagination(page)

  res.json(users);
});

app.get("/api/user/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const mentor = await findUserById(id)
  res.json(mentor);
});

app.post("/api/admin/approve-user/:userId", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const approvedUser = await approveUser(userId)

  if (!approvedUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ message: `${userId} has been approved` });

  
});

app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});


const port = process.env.PORT ?? 3000;

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`),
);
