import { DurableObject } from "cloudflare:workers";
import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import publicProjects from "../assets/js/projects.js";
import privateProjects from "../.private/projects.json";
import {
  compareProjectUpdates,
  isGuestVisible,
  toGuestProject,
  normalizePreferences,
} from "../assets/js/project-access.js";

const deriveKey = promisify(scrypt);
const allProjects = [
  ...new Map(
    [...publicProjects, ...privateProjects].map((project) => [
      project.id,
      project,
    ]),
  ).values(),
].sort(compareProjectUpdates);
const guestProjects = allProjects.filter(isGuestVisible).map(toGuestProject);
const additionalProjects = allProjects.filter(
  (project) => !isGuestVisible(project),
);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const emptyPreferences = () => ({ guest: [], personal: [], pinned: [] });
function json(status, value, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
function tokenId(request) {
  const token = request.headers
    .get("Cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("portfolio_session="))
    ?.slice("portfolio_session=".length);
  return token && /^[a-f0-9]{64}$/.test(token) ? hash(token) : null;
}
function guestPayload() {
  return {
    authenticated: false,
    user: null,
    expiresAt: null,
    projects: guestProjects,
  };
}
function cookie(request, token, age) {
  return (
    "portfolio_session=" +
    token +
    "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" +
    age +
    (new URL(request.url).protocol === "https:" ? "; Secure" : "")
  );
}
async function readJson(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    throw new Error("Invalid content type.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Body missing.");
  let size = 0;
  const parts = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      throw new Error("Body too large.");
    }
    parts.push(value);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}

export class PortfolioAccount extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, expires INTEGER NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS preferences (username TEXT PRIMARY KEY, data TEXT NOT NULL)",
    );
  }
  preferences() {
    const row = this.sql
      .exec("SELECT data FROM preferences WHERE username = 'gyagp'")
      .toArray()[0];
    return row
      ? normalizePreferences(JSON.parse(row.data), allProjects)
      : emptyPreferences();
  }
  payload(session) {
    return session
      ? {
          authenticated: true,
          user: "gyagp",
          expiresAt: session.expires,
          projects: allProjects,
          preferences: this.preferences(),
        }
      : guestPayload();
  }
  async fetch(request) {
    // Serializing the small account workload also makes throttling and preference writes atomic.
    return this.ctx.blockConcurrencyWhile(async () => {
      try {
        return await this.handle(request);
      } catch {
        return json(500, { error: "serverError" });
      }
    });
  }
  async handle(request) {
    const url = new URL(request.url);
    const now = Date.now();
    this.sql.exec("DELETE FROM sessions WHERE expires <= ?", now);
    this.sql.exec("DELETE FROM attempts WHERE expires <= ?", now);
    const id = tokenId(request);
    const session = id
      ? this.sql
          .exec("SELECT expires FROM sessions WHERE id = ?", id)
          .toArray()[0]
      : null;
    if (url.pathname === "/api/projects" && request.method === "GET")
      return json(200, this.payload(session));
    if (url.pathname === "/api/private-projects" && request.method === "GET") {
      return session
        ? json(200, { projects: additionalProjects })
        : json(401, { error: "unauthorized" });
    }
    const mutation = ["POST", "PUT", "DELETE", "PATCH"].includes(
      request.method,
    );
    if (
      mutation &&
      (request.headers.get("Origin") !== url.origin ||
        request.headers.get("Sec-Fetch-Site") === "cross-site")
    ) {
      return json(403, { error: "forbidden" });
    }
    if (url.pathname === "/api/preferences") {
      if (!session) return json(401, { error: "unauthorized" });
      if (request.method === "GET")
        return json(200, { preferences: this.preferences() });
      if (request.method !== "PUT")
        return json(405, { error: "methodNotAllowed" });
      let value;
      try {
        value = normalizePreferences(
          (await readJson(request)).preferences,
          allProjects,
        );
      } catch {
        return json(400, { error: "badRequest" });
      }
      this.sql.exec(
        "INSERT INTO preferences (username, data) VALUES ('gyagp', ?) ON CONFLICT(username) DO UPDATE SET data = excluded.data",
        JSON.stringify(value),
      );
      return json(200, { preferences: value });
    }
    if (url.pathname === "/api/logout" && request.method === "POST") {
      if (id) this.sql.exec("DELETE FROM sessions WHERE id = ?", id);
      return json(200, guestPayload(), {
        "Set-Cookie": cookie(request, "", 0),
      });
    }
    if (url.pathname !== "/api/login" || request.method !== "POST")
      return json(404, { error: "notFound" });
    let auth;
    try {
      auth = JSON.parse(this.env.AUTH_CONFIG || "null");
    } catch {
      /* Fail closed. */
    }
    if (
      !auth ||
      auth.username !== "gyagp" ||
      !/^[a-f0-9]{64}$/.test(auth.salt) ||
      !/^[a-f0-9]{128}$/.test(auth.passwordHash)
    ) {
      return json(503, { error: "unavailable" });
    }
    const ip = hash(request.headers.get("CF-Connecting-IP") || "local");
    const attempt = this.sql
      .exec("SELECT count, expires FROM attempts WHERE id = ?", ip)
      .toArray()[0];
    if (attempt?.count >= 5)
      return json(
        429,
        { error: "rateLimit" },
        { "Retry-After": String(Math.ceil((attempt.expires - now) / 1000)) },
      );
    let body;
    try {
      body = await readJson(request);
    } catch {
      return json(400, { error: "badRequest" });
    }
    if (
      typeof body?.username !== "string" ||
      typeof body.password !== "string" ||
      body.username.length > 64 ||
      body.password.length > 256
    )
      return json(400, { error: "badRequest" });
    this.sql.exec(
      "INSERT INTO attempts (id, count, expires) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET count = count + 1",
      ip,
      now + 900000,
    );
    const candidate = await deriveKey(body.password, auth.salt, 64);
    if (
      !timingSafeEqual(candidate, Buffer.from(auth.passwordHash, "hex")) ||
      body.username !== "gyagp"
    )
      return json(401, { error: "invalidCredentials" });
    this.sql.exec("DELETE FROM attempts WHERE id = ?", ip);
    if (id) this.sql.exec("DELETE FROM sessions WHERE id = ?", id);
    const token = randomBytes(32).toString("hex");
    const expires = now + 8 * 60 * 60 * 1000;
    this.sql.exec(
      "INSERT INTO sessions (id, expires) VALUES (?, ?)",
      hash(token),
      expires,
    );
    return json(200, this.payload({ expires }), {
      "Set-Cookie": cookie(request, token, 8 * 60 * 60),
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      url.pathname === "/api/projects" &&
      request.method === "GET" &&
      !tokenId(request)
    )
      return json(200, guestPayload());
    if (url.pathname.startsWith("/api/"))
      return env.PORTFOLIO_ACCOUNT.getByName("gyagp").fetch(request);
    if (url.pathname === "/favicon.ico")
      return new Response(null, { status: 204 });
    return env.ASSETS.fetch(request);
  },
};
