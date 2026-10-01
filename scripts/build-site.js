import fs from "node:fs/promises";
import path from "node:path";
import publicProjects from "../assets/js/projects.js";
import { isGuestVisible } from "../assets/js/project-access.js";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");
if (!publicProjects.every(isGuestVisible))
  throw new Error("Guest catalogue contains a protected-only project.");
if (
  publicProjects.some(
    (project) =>
      project.visibility !== "public" && (project.repo || project.futureSource),
  )
)
  throw new Error("Guest catalogue contains a private code link.");
// Only these files may be uploaded as public Worker Assets.
const files = [
  "index.html",
  "projects.html",
  "links.html",
  "assets/css/portfolio.css",
  "assets/images/mark.svg",
  "assets/js/portfolio.js",
  "assets/js/projects.js",
  "assets/js/project-access.js",
];
await fs.mkdir(output, { recursive: true });
// Fail if an unexpected file exists rather than silently uploading a stale secret.
async function existing(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    result.push(
      ...(entry.isDirectory() ? await existing(filename) : [filename]),
    );
  }
  return result;
}
for (const filename of await existing(output)) {
  const relative = path.relative(output, filename).split(path.sep).join("/");
  if (![...files, "_headers"].includes(relative))
    throw new Error("Unexpected public asset: " + relative);
}
for (const relative of files) {
  await fs.mkdir(path.dirname(path.join(output, relative)), {
    recursive: true,
  });
  await fs.copyFile(path.join(root, relative), path.join(output, relative));
}
await fs.writeFile(
  path.join(output, "_headers"),
  [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  X-Frame-Options: DENY",
    "  Cache-Control: no-cache",
    "  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    "",
  ].join("\n"),
);
console.log(
  "Built " +
    files.length +
    " explicitly allowed public files; protected metadata is not an asset.",
);
