import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cli = path.join(root, "node_modules/wrangler/bin/wrangler.js");
const expectedAccount = "f56e091adbebc96c25ea502b2934b59e";
const identity = spawnSync(process.execPath, [cli, "whoami", "--json"], {
  cwd: root,
  encoding: "utf8",
});
if (identity.status !== 0)
  throw new Error(
    "Cannot verify Cloudflare identity. Activate the gyagp0 profile for this directory.",
  );
const profile = JSON.parse(identity.stdout);
if (
  profile.email !== "gyagp0@gmail.com" ||
  !profile.accounts?.some((account) => account.id === expectedAccount)
) {
  throw new Error(
    "Cloudflare identity does not match the intended personal account.",
  );
}
if (
  process.env.CLOUDFLARE_ACCOUNT_ID &&
  process.env.CLOUDFLARE_ACCOUNT_ID !== expectedAccount
)
  throw new Error("Unexpected Cloudflare account override.");
const config = JSON.parse(
  await fs.readFile(path.join(root, "wrangler.json"), "utf8"),
);
const legacy = JSON.parse(
  await fs.readFile(path.join(root, "cloudflare/wrangler-legacy.json"), "utf8"),
);
if (config.account_id !== expectedAccount)
  throw new Error("Unexpected account in Wrangler configuration.");
if (
  legacy.account_id !== expectedAccount ||
  config.durable_objects.bindings.find(
    (binding) => binding.name === "PORTFOLIO_ACCOUNT",
  )?.script_name !== legacy.name
) {
  throw new Error(
    "The homepage must retain its existing account storage binding.",
  );
}
const auth = JSON.parse(
  await fs.readFile(path.join(root, ".private/auth.json"), "utf8"),
);
if (auth.username !== "gyagp" || !/^[a-f0-9]{128}$/.test(auth.passwordHash))
  throw new Error("Administrator is not configured.");
await fs.writeFile(
  path.join(root, ".private/worker-secrets.json"),
  JSON.stringify({ AUTH_CONFIG: JSON.stringify(auth) }),
  { mode: 0o600 },
);
await import("./build-site.js");
const deployment = spawnSync(
  process.execPath,
  [
    cli,
    "deploy",
    "--config",
    "wrangler.json",
    "--profile",
    "gyagp0",
    "--message",
    "Bilingual portfolio with protected projects and persistent account preferences",
  ],
  { cwd: root, stdio: "inherit" },
);
if (deployment.status !== 0) process.exit(deployment.status || 1);

// Publish and verify the new destination before changing the old entry point.
const destination = "https://homepage.gyagp.workers.dev";
let healthy = false;
for (let attempt = 0; attempt < 10; attempt++) {
  try {
    const health = await fetch(destination + "/api/projects", {
      signal: AbortSignal.timeout(5000),
    });
    if (health.ok) {
      const result = await health.json();
      healthy =
        result.authenticated === false &&
        Array.isArray(result.projects) &&
        result.projects.length > 0;
    }
  } catch {
    /* A new workers.dev hostname may take a moment to become available. */
  }
  if (healthy) break;
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
if (!healthy) {
  throw new Error(
    "The new homepage did not pass its availability check; the old entry point was retained.",
  );
}
const redirectDeployment = spawnSync(
  process.execPath,
  [
    cli,
    "deploy",
    "--config",
    "cloudflare/wrangler-legacy.json",
    "--profile",
    "gyagp0",
    "--secrets-file",
    path.join(root, ".private/worker-secrets.json"),
    "--message",
    "Preserve account storage and redirect the old homepage address",
  ],
  { cwd: root, stdio: "inherit" },
);
if (redirectDeployment.status !== 0)
  process.exit(redirectDeployment.status || 1);
