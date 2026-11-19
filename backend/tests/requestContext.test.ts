import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { it, mock } from "node:test";
import { requestContext } from "../middleware/requestContext";

it("logs a request path without query parameters", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  const output = mock.method(console, "log", () => undefined);

  try {
    const response = Object.assign(new EventEmitter(), {
      locals: {} as Record<string, unknown>,
      statusCode: 200,
      setHeader: () => undefined,
    });
    const request = {
      header: () => undefined,
      method: "GET",
      path: "/reset-password",
      originalUrl: "/reset-password?token=private-token",
    };

    requestContext(
      request as unknown as Parameters<typeof requestContext>[0],
      response as unknown as Parameters<typeof requestContext>[1],
      () => undefined,
    );
    response.emit("finish");

    const entry = JSON.parse(String(output.mock.calls[0].arguments[0]));
    assert.equal(entry.path, "/reset-password");
    assert.ok(!JSON.stringify(entry).includes("private-token"));
  } finally {
    output.mock.restore();
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});
