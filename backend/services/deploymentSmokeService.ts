interface SmokeResponse {
  status?: unknown;
}

interface SmokeCheck {
  path: string;
  expectedStatus: string;
}

const smokeChecks: SmokeCheck[] = [
  { path: "/api/health", expectedStatus: "ok" },
  { path: "/api/ready", expectedStatus: "ready" },
];

export async function runDeploymentSmokeTest(
  appUrl: string,
  request: typeof fetch = fetch,
) {
  const results: Array<{ path: string; status: string }> = [];

  for (const check of smokeChecks) {
    const url = new URL(check.path, appUrl);
    const response = await request(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(
        `${check.path} returned HTTP ${response.status} instead of 200`,
      );
    }

    const body = (await response.json()) as SmokeResponse;
    if (body.status !== check.expectedStatus) {
      throw new Error(
        `${check.path} returned an unexpected status payload`,
      );
    }

    results.push({ path: check.path, status: check.expectedStatus });
  }

  return results;
}
