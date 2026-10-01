import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const cli = path.join(root, "node_modules/wrangler/bin/wrangler.js");
await import("./build-site.js");
for (const [config, output] of [
  ["wrangler.json", "homepage-build"],
  ["cloudflare/wrangler-legacy.json", "legacy-build"],
]) {
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "deploy",
      "--config",
      path.join(root, config),
      "--dry-run",
      "--outdir",
      path.join(root, "artifacts", output),
    ],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
