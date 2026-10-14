import { build } from "esbuild";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(backendDirectory, "build");
const migrationsOutputDirectory = path.join(outputDirectory, "migrations");

await fs.rm(outputDirectory, { recursive: true, force: true });

await build({
  entryPoints: {
    server: path.join(backendDirectory, "server.ts"),
    migrate: path.join(backendDirectory, "scripts/migrate.ts"),
    "smoke-production": path.join(
      backendDirectory,
      "scripts/smokeProduction.ts",
    ),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  packages: "external",
  outdir: outputDirectory,
});

await fs.mkdir(migrationsOutputDirectory, { recursive: true });

for (const migrationName of await fs.readdir(
  path.join(backendDirectory, "migrations"),
)) {
  if (!migrationName.endsWith(".sql")) {
    continue;
  }

  await fs.copyFile(
    path.join(backendDirectory, "migrations", migrationName),
    path.join(migrationsOutputDirectory, migrationName),
  );
}
