const maxEmailLength = 254;
const maxPasswordLength = 256;

export function normalizeLoginCredentials(input: unknown) {
  const body = input && typeof input === "object" ? input : {};
  const { email, password } = body as { email?: unknown; password?: unknown };

  return {
    email: typeof email === "string" ? email.trim() : "",
    password: typeof password === "string" ? password : "",
  };
}

export function getLoginValidationError(input: {
  email: string;
  password: string;
}) {
  if (!input.email || !input.password) {
    return "Email and password are required";
  }

  if (input.email.length > maxEmailLength || input.password.length > maxPasswordLength) {
    return "Email or password is too long";
  }

  return null;
}
