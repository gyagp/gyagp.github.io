import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createPortfolioServer } from "./app.js";
import { createFilePreferenceStore } from "./preference-store.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const privateDirectory =
  process.env.PORTFOLIO_PRIVATE_DIR || path.join(root, ".private");
async function readOptional(name, fallback) {
  try {
    return JSON.parse(
      await readFile(path.join(privateDirectory, name), "utf8"),
    );
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}
const server = createPortfolioServer({
  auth: await readOptional("auth.json", null),
  privateProjects: await readOptional("projects.json", []),
  secureCookies: process.env.NODE_ENV === "production",
  publicOrigin: process.env.PUBLIC_ORIGIN || null,
  preferenceStore: createFilePreferenceStore(
    path.join(privateDirectory, "preferences.json"),
  ),
});
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
server.listen(port, host, () => {
  console.log("Portfolio listening at http://" + host + ":" + port);
});
