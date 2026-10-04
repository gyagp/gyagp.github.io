import http from "node:http";
import path from "node:path";
import { readFile, realpath } from "node:fs/promises";
import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import publicProjects from "../assets/js/projects.js";
import {
  compareProjectUpdates,
  isGuestVisible,
  toGuestProject,
  normalizePreferences,
} from "../assets/js/project-access.js";

const deriveKey = promisify(scrypt);
const workspace = fileURLToPath(new URL("../", import.meta.url));
const cookieName = "portfolio_session";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

export function createPortfolioServer({
  root = workspace,
  auth = null,
  privateProjects = [],
  secureCookies = false,
  publicOrigin = null,
  sessionDuration = 8 * 60 * 60 * 1000,
  now = Date.now,
  preferenceStore = null,
} = {}) {
  if (
    auth &&
    (auth.username !== "gyagp" ||
      !/^[a-f0-9]{64}$/.test(auth.salt) ||
      !/^[a-f0-9]{128}$/.test(auth.passwordHash))
  ) {
    throw new Error("Invalid administrator configuration.");
  }
  if (!Array.isArray(privateProjects))
    throw new Error("Protected projects must be an array.");
  // Full server-side records override the redacted static catalogue by ID.
  const allProjects = [
    ...new Map(
      [...publicProjects, ...privateProjects].map((project) => [
        project.id,
        project,
      ]),
    ).values(),
  ].sort(compareProjectUpdates);
  const publicData = allProjects.filter(isGuestVisible).map(toGuestProject);
  const additionalProjects = allProjects.filter(
    (project) => !isGuestVisible(project),
  );
  const sessions = new Map();
  const attempts = new Map();
  let savedPreferences = null;
  const preferences = preferenceStore || {
    async get() {
      return savedPreferences;
    },
    async set(value) {
      savedPreferences = value;
    },
  };
  let activeLogins = 0;
  const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
  const cookie = (token, age) =>
    cookieName +
    "=" +
    token +
    "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" +
    age +
    (secureCookies ? "; Secure" : "");
  const sessionKey = (request) => {
    const token = request.headers.cookie
      ?.split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    return token && /^[a-f0-9]{64}$/.test(token) ? tokenHash(token) : null;
  };
  function currentSession(request) {
    const key = sessionKey(request);
    const session = sessions.get(key);
    if (session && session.username === "gyagp" && session.expiresAt > now())
      return session;
    if (key) sessions.delete(key);
    return null;
  }
  async function payload(session) {
    return {
      authenticated: Boolean(session),
      user: session?.username || null,
      expiresAt: session?.expiresAt || null,
      projects: session ? allProjects : publicData,
      ...(session
        ? {
            preferences: (await preferences.get()) || {
              guest: [],
              personal: [],
              pinned: [],
            },
          }
        : {}),
    };
  }
  function json(response, status, data) {
    response
      .writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, private",
        Vary: "Cookie",
      })
      .end(JSON.stringify(data));
  }
  function validOrigin(request) {
    if (request.headers["sec-fetch-site"] === "cross-site") return false;
    const expected =
      publicOrigin ||
      (secureCookies ? "https://" : "http://") + request.headers.host;
    try {
      return request.headers.origin === new URL(expected).origin;
    } catch {
      return false;
    }
  }
  async function readJson(request) {
    if (!request.headers["content-type"]?.startsWith("application/json"))
      throw new Error("body");
    let size = 0;
    const chunks = [];
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 4096) throw new Error("body");
      chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }
  async function handle(request, response) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-Frame-Options", "DENY");
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
    } catch {
      return json(response, 400, { error: "badRequest" });
    }
    if (pathname.startsWith("/api/")) {
      for (const [key, session] of sessions)
        if (session.expiresAt <= now()) sessions.delete(key);
      for (const [key, attempt] of attempts)
        if (attempt.until <= now()) attempts.delete(key);
      if (pathname === "/api/projects" && request.method === "GET") {
        return json(response, 200, await payload(currentSession(request)));
      }
      if (pathname === "/api/private-projects" && request.method === "GET") {
        if (!currentSession(request))
          return json(response, 401, { error: "unauthorized" });
        return json(response, 200, { projects: additionalProjects });
      }
      if (pathname === "/api/preferences") {
        if (!currentSession(request))
          return json(response, 401, { error: "unauthorized" });
        if (request.method === "GET")
          return json(response, 200, {
            preferences: (await preferences.get()) || {
              guest: [],
              personal: [],
              pinned: [],
            },
          });
        if (request.method !== "PUT")
          return json(response, 405, { error: "methodNotAllowed" });
        if (!validOrigin(request))
          return json(response, 403, { error: "forbidden" });
        let value;
        try {
          value = normalizePreferences(
            (await readJson(request)).preferences,
            allProjects,
          );
        } catch {
          return json(response, 400, { error: "badRequest" });
        }
        await preferences.set(value);
        return json(response, 200, { preferences: value });
      }
      if (pathname === "/api/logout" && request.method === "POST") {
        if (!validOrigin(request))
          return json(response, 403, { error: "forbidden" });
        const key = sessionKey(request);
        if (key) sessions.delete(key);
        response.setHeader("Set-Cookie", cookie("", 0));
        return json(response, 200, await payload(null));
      }
      if (pathname === "/api/login" && request.method === "POST") {
        if (!validOrigin(request))
          return json(response, 403, { error: "forbidden" });
        if (!auth) return json(response, 503, { error: "unavailable" });
        const ip = request.socket.remoteAddress;
        let attempt = attempts.get(ip);
        if (attempt && attempt.count >= 5) {
          response.setHeader(
            "Retry-After",
            String(Math.ceil((attempt.until - now()) / 1000)),
          );
          return json(response, 429, { error: "rateLimit" });
        }
        if (activeLogins >= 4)
          return json(response, 429, { error: "rateLimit" });
        let body;
        try {
          body = await readJson(request);
        } catch {
          return json(response, 400, { error: "badRequest" });
        }
        if (
          typeof body?.username !== "string" ||
          typeof body?.password !== "string" ||
          body.username.length > 64 ||
          body.password.length > 256
        ) {
          return json(response, 400, { error: "badRequest" });
        }
        if (!attempt) {
          if (attempts.size >= 10000)
            attempts.delete(attempts.keys().next().value);
          attempt = { count: 0, until: now() + 15 * 60 * 1000 };
          attempts.set(ip, attempt);
        }
        // Count attempts before the async hash, so concurrent requests cannot evade the limit.
        attempt.count++;
        activeLogins++;
        let candidate;
        try {
          candidate = await deriveKey(body.password, auth.salt, 64);
        } finally {
          activeLogins--;
        }
        const passwordMatches = timingSafeEqual(
          candidate,
          Buffer.from(auth.passwordHash, "hex"),
        );
        if (body.username !== "gyagp" || !passwordMatches)
          return json(response, 401, { error: "invalidCredentials" });
        attempts.delete(ip);
        const oldKey = sessionKey(request);
        if (oldKey) sessions.delete(oldKey);
        const token = randomBytes(32).toString("hex");
        const session = {
          username: "gyagp",
          expiresAt: now() + sessionDuration,
        };
        sessions.set(tokenHash(token), session);
        response.setHeader(
          "Set-Cookie",
          cookie(token, Math.floor(sessionDuration / 1000)),
        );
        return json(response, 200, await payload(session));
      }
      return json(response, 404, { error: "notFound" });
    }
    if (!["GET", "HEAD"].includes(request.method))
      return json(response, 405, { error: "methodNotAllowed" });
    if (pathname === "/favicon.ico") return response.writeHead(204).end();
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const allowed =
      ["index.html", "projects.html", "links.html"].includes(relative) ||
      /^(assets|archive)\//.test(relative);
    if (
      !allowed ||
      relative.includes("\\") ||
      relative.split("/").some((part) => part.startsWith("."))
    ) {
      return json(response, 404, { error: "notFound" });
    }
    try {
      const filename = await realpath(path.resolve(root, relative));
      const expectedPath = path.resolve(root, relative);
      if (filename.toLowerCase() !== expectedPath.toLowerCase())
        return json(response, 404, { error: "notFound" });
      const contentType = mimeTypes[path.extname(filename).toLowerCase()];
      if (!contentType) return json(response, 404, { error: "notFound" });
      const body = await readFile(filename);
      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      return json(response, 404, { error: "notFound" });
    }
  }
  const server = http.createServer((request, response) => {
    handle(request, response).catch(() => {
      if (!response.headersSent) json(response, 500, { error: "serverError" });
      else response.end();
    });
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}
