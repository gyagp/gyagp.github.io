import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const directory =
  process.env.PORTFOLIO_PRIVATE_DIR ||
  fileURLToPath(new URL("../.private/", import.meta.url));
const target = path.join(directory, "auth.json");
try {
  await access(target);
  console.error(
    "An administrator is already configured. Back up and remove auth.json before replacing it.",
  );
  process.exit(1);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (!process.stdin.isTTY)
  throw new Error("Run this command in an interactive terminal.");
process.stdout.write("Set the password for gyagp (input hidden): ");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");
const password = await new Promise((resolve, reject) => {
  let value = "";
  function onData(chunk) {
    for (const character of chunk) {
      if (character === "\u0003") {
        cleanup();
        reject(new Error("Cancelled."));
        return;
      }
      if (character === "\r" || character === "\n") {
        cleanup();
        resolve(value);
        return;
      }
      if (character === "\u007f" || character === "\b")
        value = value.slice(0, -1);
      else if (character >= " " && value.length < 256) value += character;
    }
  }
  function cleanup() {
    process.stdin.off("data", onData);
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
  }
  process.stdin.on("data", onData);
});
if (!password) throw new Error("Password cannot be empty.");
const salt = randomBytes(32).toString("hex");
const passwordHash = scryptSync(password, salt, 64).toString("hex");
await mkdir(directory, { recursive: true });
await writeFile(
  target,
  JSON.stringify({ username: "gyagp", salt, passwordHash }, null, 2) + "\n",
  { flag: "wx", mode: 0o600 },
);
try {
  await writeFile(path.join(directory, "projects.json"), "[]\n", {
    flag: "wx",
    mode: 0o600,
  });
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}
console.log("Administrator configured. No plaintext password was saved.");
