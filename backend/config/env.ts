import { log } from "../services/logger";

const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function optionalEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function optionalEmailList(name: string) {
  const value = optionalEnv(name);
  if (!value) return undefined;

  const addresses = value
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  return addresses.length ? addresses : undefined;
}

const sessionSecret = isProduction
  ? requireEnv("SESSION_SECRET")
  : (optionalEnv("SESSION_SECRET") ?? "development-only-change-me");

if (!isProduction && !process.env.SESSION_SECRET) {
  log("warn", "config.development_session_secret");
}

export const env = {
  appUrl: optionalEnv("APP_URL"),
  awsRegion: optionalEnv("AWS_REGION"),
  databaseUrl: requireEnv("DATABASE_URL"),
  isProduction,
  port: optionalEnv("PORT") ?? "3000",
  sesFromEmail: optionalEnv("SES_FROM_EMAIL"),
  adminNotificationEmail: optionalEmailList("ADMIN_NOTIFICATION_EMAIL"),
  contactEmail: optionalEmailList("CONTACT_EMAIL"),
  sessionSecret,
};

export function getRegistrationEmailConfig() {
  if (!env.awsRegion || !env.sesFromEmail || !env.adminNotificationEmail) {
    return null;
  }

  return {
    from: env.sesFromEmail,
    to: env.adminNotificationEmail,
  };
}

export function getContactUsEmailConfig() {
  if (!env.awsRegion || !env.sesFromEmail || !env.contactEmail) {
    return null;
  }

  return {
    from: env.sesFromEmail,
    to: env.contactEmail,
  };
}

export function getPasswordResetEmailConfig() {
  if (!env.awsRegion || !env.sesFromEmail) return null;
  return { from: env.sesFromEmail };
}

export function getRegistrationAcceptanceConfig() {
  if (!env.awsRegion || !env.sesFromEmail) return null;
  return { from: env.sesFromEmail };
}

