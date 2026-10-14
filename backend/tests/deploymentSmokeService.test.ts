import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runDeploymentSmokeTest } from "../services/deploymentSmokeService";

function jsonResponse(status: string, responseStatus = 200) {
  return new Response(JSON.stringify({ status }), {
    status: responseStatus,
    headers: { "content-type": "application/json" },
  });
}

describe("production deployment smoke test", () => {
  it("checks application health and database readiness", async () => {
    const requestedPaths: string[] = [];
    const request: typeof fetch = async (input) => {
      const url = new URL(input.toString());
      requestedPaths.push(url.pathname);
      return jsonResponse(url.pathname === "/api/health" ? "ok" : "ready");
    };

    const results = await runDeploymentSmokeTest(
      "https://www.vikingconnect.org",
      request,
    );

    assert.deepEqual(requestedPaths, ["/api/health", "/api/ready"]);
    assert.deepEqual(results, [
      { path: "/api/health", status: "ok" },
      { path: "/api/ready", status: "ready" },
    ]);
  });

  it("fails when an endpoint is unavailable", async () => {
    const request: typeof fetch = async () => jsonResponse("unavailable", 503);

    await assert.rejects(
      runDeploymentSmokeTest("https://www.vikingconnect.org", request),
      /returned HTTP 503/,
    );
  });

  it("fails when an endpoint returns an unexpected payload", async () => {
    const request: typeof fetch = async () => jsonResponse("unexpected");

    await assert.rejects(
      runDeploymentSmokeTest("https://www.vikingconnect.org", request),
      /unexpected status payload/,
    );
  });
});
