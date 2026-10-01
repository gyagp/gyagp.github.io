import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";

export function createFilePreferenceStore(filename) {
  let pending = Promise.resolve();
  return {
    async get() {
      await pending;
      try {
        return JSON.parse(await readFile(filename, "utf8"));
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
    },
    async set(preferences) {
      const operation = pending.then(async () => {
        await mkdir(path.dirname(filename), { recursive: true });
        await writeFile(filename + ".tmp", JSON.stringify(preferences) + "\n", {
          mode: 0o600,
        });
        await rename(filename + ".tmp", filename);
      });
      pending = operation.catch(() => {});
      await operation;
    },
  };
}
