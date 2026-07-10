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

const sessionSecret = isProduction
  ? requireEnv("SESSION_SECRET")
  : (optionalEnv("SESSION_SECRET") ?? "development-only-change-me");

if (!isProduction && !process.env.SESSION_SECRET) {
  console.warn("SESSION_SECRET is not set; using a development-only secret");
}

export const env = {
  appUrl: optionalEnv("APP_URL"),
  databaseUrl: requireEnv("DATABASE_URL"),
  isProduction,
  port: optionalEnv("PORT") ?? "3000",
  resendApiKey: optionalEnv("RESEND_API"),
  resendFromEmail: optionalEnv("FROM_RESEND_EMAIL"),
  resendToEmail: optionalEnv("TO_RESEND_EMAIL"),
  sessionSecret,
};

export function getRegistrationEmailConfig() {
  if (!env.resendApiKey || !env.resendFromEmail || !env.resendToEmail) {
    return null;
  }

  return {
    apiKey: env.resendApiKey,
    from: env.resendFromEmail,
    to: env.resendToEmail,
  };
}
