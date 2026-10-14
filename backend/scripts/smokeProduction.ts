import { env } from "../config/env";
import { runDeploymentSmokeTest } from "../services/deploymentSmokeService";
import { log, logError } from "../services/logger";

async function smokeProduction() {
  if (!env.appUrl) {
    throw new Error("APP_URL is required for the production smoke test");
  }

  log("info", "deployment.smoke_started", { appUrl: env.appUrl });
  const checks = await runDeploymentSmokeTest(env.appUrl);
  log("info", "deployment.smoke_completed", { checks });
}

smokeProduction().catch((error) => {
  logError("deployment.smoke_failed", error);
  process.exit(1);
});
