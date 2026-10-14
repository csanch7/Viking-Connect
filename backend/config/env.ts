import { log } from "../services/logger";

type EnvironmentSource = Record<string, string | undefined>;

function optionalEnv(source: EnvironmentSource, name: string) {
  return source[name]?.trim() || undefined;
}

function requireEnv(source: EnvironmentSource, name: string) {
  const value = optionalEnv(source, name);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function validateEmail(value: string, name: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`${name} must contain valid email addresses`);
  }

  return value;
}

function emailList(
  source: EnvironmentSource,
  name: string,
  required: boolean,
) {
  const value = required
    ? requireEnv(source, name)
    : optionalEnv(source, name);
  if (!value) return undefined;

  const addresses = value
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)
    .map((address) => validateEmail(address, name));

  if (!addresses.length) {
    throw new Error(`${name} must contain at least one email address`);
  }

  return addresses;
}

function applicationUrl(source: EnvironmentSource, required: boolean) {
  const value = required
    ? requireEnv(source, "APP_URL")
    : optionalEnv(source, "APP_URL");
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("APP_URL must be a valid absolute URL");
  }

  if (!(["http:", "https:"] as string[]).includes(url.protocol)) {
    throw new Error("APP_URL must use HTTP or HTTPS");
  }

  if (required && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production");
  }

  if (
    url.username ||
    url.password ||
    (url.pathname !== "/" && url.pathname !== "") ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "APP_URL must be an origin without credentials, a path, a query, or a fragment",
    );
  }

  return url.origin;
}

function port(source: EnvironmentSource) {
  const value = optionalEnv(source, "PORT") ?? "3000";
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return value;
}

export function loadEnv(source: EnvironmentSource = process.env) {
  const isProduction = source.NODE_ENV === "production";
  const sessionSecret = isProduction
    ? requireEnv(source, "SESSION_SECRET")
    : (optionalEnv(source, "SESSION_SECRET") ?? "development-only-change-me");

  if (isProduction && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production");
  }

  const sesFromEmailValue = isProduction
    ? requireEnv(source, "SES_FROM_EMAIL")
    : optionalEnv(source, "SES_FROM_EMAIL");

  return {
    appUrl: applicationUrl(source, isProduction),
    awsRegion: isProduction
      ? requireEnv(source, "AWS_REGION")
      : optionalEnv(source, "AWS_REGION"),
    databaseUrl: requireEnv(source, "DATABASE_URL"),
    isProduction,
    port: port(source),
    sesFromEmail: sesFromEmailValue
      ? validateEmail(sesFromEmailValue, "SES_FROM_EMAIL")
      : undefined,
    adminNotificationEmail: emailList(
      source,
      "ADMIN_NOTIFICATION_EMAIL",
      isProduction,
    ),
    contactEmail: emailList(source, "CONTACT_EMAIL", isProduction),
    sessionSecret,
  };
}

export const env = loadEnv();

if (!env.isProduction && !process.env.SESSION_SECRET) {
  log("warn", "config.development_session_secret");
}

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
