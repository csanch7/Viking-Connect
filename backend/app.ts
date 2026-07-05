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
  updateHelpText,
  updateAOEList
} from "./database";

import session from "express-session";
import pgSession from "connect-pg-simple";
import { requireAdmin, requireAuth } from "./middleware/auth";
import { Resend } from 'resend';


const app = express();
const PgSession = pgSession(session);
const databaseUrl = process.env.DATABASE_URL!;
const sessionSecret =
  process.env.SESSION_SECRET ?? "development-only-change-me";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist");
const resend = new Resend(process.env.RESEND_API);
const adminPendingUsersPath = "/admin/pending-users";
const adminPendingUsersUrl = process.env.APP_URL
  ? `${process.env.APP_URL.replace(/\/$/, "")}${adminPendingUsersPath}`
  : adminPendingUsersPath;
type RegistrationEmailUser = Omit<User, "password">;

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function renderAdminRegistrationEmail(user: RegistrationEmailUser) {
  const areasOfExpertise = user.aoeList?.length
    ? user.aoeList.map((area) => escapeHtml(area)).join(", ")
    : "Not provided";

  const linkedinValue = escapeHtml(user.linkedin);
  const linkedinContent = isHttpUrl(user.linkedin)
    ? `<a href="${linkedinValue}" style="color: #090909; text-decoration: underline; text-decoration-color: #ffc72c;">${linkedinValue}</a>`
    : linkedinValue;

  const linkedinRow = user.linkedin
    ? `
      <tr>
        <td style="padding: 12px 0; color: #676767; font-size: 14px; vertical-align: top;">LinkedIn</td>
        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">
          ${linkedinContent}
        </td>
      </tr>
    `
    : "";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Registration Pending Review</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f7f5ef; color: #090909; font-family: Arial, Helvetica, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          A new STL Mentor Program registration is waiting for admin approval.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f7f5ef; margin: 0; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border: 1px solid #dedbd2; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: #090909; padding: 28px 32px;">
                    <p style="margin: 0 0 8px; color: #ffc72c; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">STL Mentor Program</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 800;">New registration pending review</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 24px; color: #3b3b3b; font-size: 16px; line-height: 1.6;">
                      A new user created an account and is waiting for an administrator to approve or deny access.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-top: 1px solid #dedbd2; border-bottom: 1px solid #dedbd2;">
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Name</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(user.username)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Email</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">
                          <a href="mailto:${escapeHtml(user.email)}" style="color: #090909; text-decoration: underline; text-decoration-color: #ffc72c;">${escapeHtml(user.email)}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Account type</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(user.type)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px;">Graduation year</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(user.gradYear)}</td>
                      </tr>
                      ${linkedinRow}
                      <tr>
                        <td style="padding: 12px 0; color: #676767; font-size: 14px; vertical-align: top;">Areas of expertise</td>
                        <td style="padding: 12px 0; color: #090909; font-size: 14px; font-weight: 600; line-height: 1.5; text-align: right;">${areasOfExpertise}</td>
                      </tr>
                    </table>
                    <div style="margin: 24px 0; padding: 18px 20px; background: #fff5d2; border-left: 4px solid #ffc72c;">
                      <p style="margin: 0; color: #090909; font-size: 14px; line-height: 1.6;">
                        Review this registration in the admin pending users queue.
                      </p>
                    </div>
                    <a href="${escapeHtml(adminPendingUsersUrl)}" style="display: inline-block; padding: 13px 18px; background: #ffc72c; border-radius: 6px; color: #090909; font-size: 14px; font-weight: 800; text-decoration: none;">
                      Open pending users
                    </a>
                    <p style="margin: 18px 0 0; color: #676767; font-size: 13px; line-height: 1.5;">
                      If the button does not open, visit ${escapeHtml(adminPendingUsersPath)} after signing in as an admin.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

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

    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'chris.sanchez0505@gmail.com',
      subject: 'STL Mentorship Program: New Registered User',
      html: renderAdminRegistrationEmail(user),
      text: `A new STL Mentor Program registration is waiting for review.

Name: ${user.username}
Email: ${user.email}
Account type: ${user.type}
Graduation year: ${user.gradYear}
Areas of expertise: ${user.aoeList?.length ? user.aoeList.join(", ") : "Not provided"}

Review the registration at ${adminPendingUsersPath}.`
    })

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
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await findUserById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

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

app.get("/api/mentors/:paginator", requireAuth, async (req, res) => {
  const { paginator } = req.params;

  const page = Number(paginator);
  const rawFilter = req.query.filter;
  const rawSearchText = req.query.searchText;
  const searchText = typeof rawSearchText === "string" ? rawSearchText : undefined;

  const filter =
    typeof rawFilter === "string"
      ? [rawFilter]
      : Array.isArray(rawFilter)
        ? rawFilter.map(String)
        : [];

  const users = await getMentorsByPagination(page, filter, req.session.userId as string, searchText);
  

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

app.patch("/api/change-text/:userId", requireAuth, authLimiter, async (req, res) => {
  const { userId } = req.params;
  const { helpText } = req.body;
  if (userId !== req.session.userId) {
    res.status(403).json({ message: "Unauthorized to change another's help text" });
    return;
  }

  if (typeof helpText !== "string") {
    res.status(400).json({ message: "Help text is required" });
    return;
  }

  const updatedHelptext = await updateHelpText(helpText, userId as string)

  if (!updatedHelptext) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ message: `Help text has been successfully updated`, 
             helpText: updatedHelptext.helpText
   });

  
});

app.patch("/api/change-aoeList/:userId", requireAuth, authLimiter, async (req, res) => {
  const { userId } = req.params;
  const { aoe_list } = req.body;
  if (userId !== req.session.userId) {
    res.status(403).json({ message: "Unauthorized to change another's aoe list" });
    return;
  }

  if (!Array.isArray(aoe_list) || !aoe_list.every((area) => typeof area === "string")) {
    res.status(400).json({ message: "Area of expertise list is required" });
    return;
  }

  const updateList = await updateAOEList(aoe_list, userId as string)

  if (!updateList) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ message: `Areas of expertise have been successfully updated`, 
             aoeList: updateList.aoeList
   });

  
});

app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT ?? 3000;

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`),
);
