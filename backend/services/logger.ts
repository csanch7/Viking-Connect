export type LogLevel = "info" | "warn" | "error";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    };
  }

  return { message: String(error) };
}

export function log(
  level: LogLevel,
  message: string,
  context: Record<string, unknown> = {},
) {
  if (process.env.NODE_ENV === "test" && level === "info") {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export function logError(
  message: string,
  error: unknown,
  context: Record<string, unknown> = {},
) {
  log("error", message, { ...context, error: serializeError(error) });
}
