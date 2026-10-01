import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir } from "node:fs/promises";
import { createFilePreferenceStore } from "../server/preference-store.js";
import { createPortfolioServer } from "../server/app.js";
import publicProjects from "../assets/js/projects.js";
import {
  testAuth,
  testPassword,
  protectedFixture,
  publishedFixture,
  enterpriseFixture,
} from "./fixtures.js";
import { isGuestVisible, isPublished } from "../assets/js/project-access.js";

async function start(options = {}) {
  const server = createPortfolioServer({
    auth: testAuth,
    privateProjects: [protectedFixture],
    ...options,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + server.address().port;
  return {
    origin,
    server,
    close: () => new Promise((resolve) => server.close(resolve)),
    login: (username = "gyagp", password = testPassword, headers = {}) =>
      fetch(origin + "/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          ...headers,
        },
        body: JSON.stringify({ username, password }),
      }),
  };
}
const sessionCookie = (response) =>
  response.headers.get("set-cookie").split(";")[0];

test("public metadata and static routes never reveal protected files", async () => {
  const app = await start();
  try {
    const response = await fetch(app.origin + "/api/projects");
    const data = await response.json();
    assert.equal(data.authenticated, false);
    assert.equal(data.projects.length, publicProjects.length);
    assert.ok(data.projects.every(isGuestVisible));
    assert.ok(!JSON.stringify(data).includes(protectedFixture.repo));
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.equal(
      (await fetch(app.origin + "/api/private-projects")).status,
      401,
    );
    for (const route of [
      "/.private/auth.json",
      "/.private/projects.json",
      "/server/app.js",
      "/tests/fixtures.js",
      "/artifacts/desktop-zh.png",
      "/README.md",
      "/.git/config",
      "/assets/%2e%2e/.private/auth.json",
      "/assets/../.private/auth.json",
      "/assets/%5c..%5c.private%5cauth.json",
    ]) {
      assert.equal((await fetch(app.origin + route)).status, 404, route);
    }
    for (const route of [
      "/",
      "/assets/js/projects.js",
      "/assets/js/portfolio.js",
    ]) {
      const text = await (await fetch(app.origin + route)).text();
      assert.ok(!text.includes(protectedFixture.repo));
      assert.ok(!text.includes(testPassword));
      assert.ok(!text.includes(testAuth.passwordHash));
    }
  } finally {
    await app.close();
  }
});

test("only gyagp with the correct password gets a session; logout revokes it", async () => {
  const app = await start();
  try {
    assert.equal((await app.login("another-user")).status, 401);
    assert.equal((await app.login("gyagp", "wrong")).status, 401);
    const response = await app.login();
    assert.equal(response.status, 200);
    const cookie = sessionCookie(response);
    assert.match(response.headers.get("set-cookie"), /HttpOnly/);
    assert.match(response.headers.get("set-cookie"), /SameSite=Strict/);
    const data = await response.json();
    assert.equal(data.user, "gyagp");
    assert.equal(data.projects.length, publicProjects.length + 1);
    assert.ok(
      data.projects.some((project) => project.repo === protectedFixture.repo),
    );
    const authorized = await fetch(app.origin + "/api/private-projects", {
      headers: { Cookie: cookie },
    });
    assert.equal(authorized.status, 200);
    assert.equal(
      (
        await fetch(app.origin + "/api/private-projects", {
          headers: { Cookie: "portfolio_session=" + "0".repeat(64) },
        })
      ).status,
      401,
    );
    const logout = await fetch(app.origin + "/api/logout", {
      method: "POST",
      headers: { Cookie: cookie, Origin: app.origin },
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
    assert.equal(
      (
        await fetch(app.origin + "/api/private-projects", {
          headers: { Cookie: cookie },
        })
      ).status,
      401,
    );
  } finally {
    await app.close();
  }
});

test("cross-origin mutations, unsupported bodies and oversized inputs are rejected", async () => {
  const app = await start();
  try {
    assert.equal(
      (
        await app.login("gyagp", testPassword, {
          Origin: "https://other.example",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await app.login("gyagp", testPassword, {
          "Sec-Fetch-Site": "cross-site",
        })
      ).status,
      403,
    );
    assert.equal(
      (await app.login("gyagp", testPassword, { "Content-Type": "text/plain" }))
        .status,
      400,
    );
    assert.equal((await app.login("gyagp", "a".repeat(300))).status, 400);
    const oversized = await app.login("gyagp", "a".repeat(5000));
    assert.equal(oversized.status, 400);
    assert.equal(
      (
        await fetch(app.origin + "/api/login", {
          method: "POST",
          body: "{}",
          headers: { "Content-Type": "application/json" },
        })
      ).status,
      403,
    );
    const response = await app.login();
    const cookie = sessionCookie(response);
    assert.equal(
      (
        await fetch(app.origin + "/api/logout", {
          method: "POST",
          headers: { Cookie: cookie, Origin: "https://other.example" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(app.origin + "/api/private-projects", {
          headers: { Cookie: cookie },
        })
      ).status,
      200,
    );
  } finally {
    await app.close();
  }
});

test("sessions expire, rotate on sign-in, and use Secure cookies in production", async () => {
  let clock = Date.now();
  const app = await start({
    now: () => clock,
    sessionDuration: 1000,
    secureCookies: true,
    publicOrigin: "https://portfolio.example",
  });
  try {
    const response = await app.login("gyagp", testPassword, {
      Origin: "https://portfolio.example",
    });
    assert.match(response.headers.get("set-cookie"), /; Secure/);
    const oldCookie = sessionCookie(response);
    const renewed = await app.login("gyagp", testPassword, {
      Origin: "https://portfolio.example",
      Cookie: oldCookie,
    });
    assert.equal(
      (
        await fetch(app.origin + "/api/private-projects", {
          headers: { Cookie: oldCookie },
        })
      ).status,
      401,
    );
    const cookie = sessionCookie(renewed);
    clock += 1001;
    assert.equal(
      (
        await fetch(app.origin + "/api/private-projects", {
          headers: { Cookie: cookie },
        })
      ).status,
      401,
    );
    const data = await (
      await fetch(app.origin + "/api/projects", { headers: { Cookie: cookie } })
    ).json();
    assert.equal(data.authenticated, false);
    assert.ok(data.projects.every(isGuestVisible));
  } finally {
    await app.close();
  }
});

test("failed login attempts are limited and recover after cooldown", async () => {
  let clock = Date.now();
  const app = await start({ now: () => clock });
  try {
    for (let i = 0; i < 5; i++)
      assert.equal((await app.login("gyagp", "wrong")).status, 401);
    const limited = await app.login();
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "900");
    clock += 15 * 60 * 1000 + 1;
    assert.equal((await app.login()).status, 200);
  } finally {
    await app.close();
  }
});

test("missing account configuration fails closed", async () => {
  const app = await start({ auth: null });
  try {
    assert.equal((await app.login()).status, 503);
    assert.equal(
      (await fetch(app.origin + "/api/private-projects")).status,
      401,
    );
  } finally {
    await app.close();
  }
});

test("publication permits visitor access, but enterprise access is not publication", async () => {
  const app = await start({
    privateProjects: [protectedFixture, publishedFixture, enterpriseFixture],
  });
  try {
    const visitor = await (await fetch(app.origin + "/api/projects")).json();
    assert.equal(visitor.projects.length, publicProjects.length + 1);
    const released = visitor.projects.find(
      (project) => project.id === publishedFixture.id,
    );
    assert.equal(released.release.url, publishedFixture.release.url);
    assert.equal(released.visibility, "private");
    assert.equal(released.repo, undefined);
    assert.equal(released.futureSource, undefined);
    assert.equal(released.internalNotes, undefined);
    assert.ok(
      !visitor.projects.some((project) => project.id === enterpriseFixture.id),
    );
    assert.ok(
      !visitor.projects.some((project) => project.id === protectedFixture.id),
    );
    const response = await app.login();
    const owner = await response.json();
    assert.equal(owner.projects.length, publicProjects.length + 3);
    assert.equal(
      owner.projects.find((project) => project.id === publishedFixture.id).repo,
      publishedFixture.repo,
    );
    const extra = await (
      await fetch(app.origin + "/api/private-projects", {
        headers: { Cookie: sessionCookie(response) },
      })
    ).json();
    assert.deepEqual(
      extra.projects.map((project) => project.id),
      [protectedFixture.id, enterpriseFixture.id],
    );
  } finally {
    await app.close();
  }
});

test("a full server record overrides its redacted catalogue entry without duplication", async () => {
  const catalogueEntry = publicProjects.find(
    (project) => project.visibility === "private",
  );
  assert.ok(catalogueEntry);
  const full = { ...catalogueEntry, repo: publishedFixture.repo };
  const app = await start({ privateProjects: [full] });
  try {
    const guest = await (await fetch(app.origin + "/api/projects")).json();
    assert.equal(guest.projects.length, publicProjects.length);
    assert.equal(
      guest.projects.find((project) => project.id === full.id).repo,
      undefined,
    );
    const owner = await (await app.login()).json();
    assert.equal(owner.projects.length, publicProjects.length);
    assert.equal(
      owner.projects.find((project) => project.id === full.id).repo,
      full.repo,
    );
  } finally {
    await app.close();
  }
});

test("published access types and the public-code alternative follow the visibility rule", () => {
  for (const access of [
    "public",
    "account",
    "registration",
    "restricted",
    "webgpu",
  ]) {
    assert.ok(
      isGuestVisible({
        ...publishedFixture,
        release: { ...publishedFixture.release, access },
      }),
      access,
    );
  }
  assert.equal(isPublished(enterpriseFixture), false);
  assert.equal(isGuestVisible(enterpriseFixture), false);
  assert.equal(
    isGuestVisible({ ...enterpriseFixture, visibility: "public" }),
    true,
  );
  assert.equal(
    isGuestVisible({ ...protectedFixture, visibility: "public" }),
    true,
  );
  assert.equal(
    isGuestVisible({
      ...publishedFixture,
      release: { ...publishedFixture.release, url: "javascript:alert(1)" },
    }),
    false,
  );
  assert.ok(publicProjects.every(isGuestVisible));
  assert.ok(
    publicProjects
      .filter((project) => project.visibility !== "public")
      .every((project) => !project.repo && !project.futureSource),
  );
});

test("account preferences require authentication and persist across server instances", async () => {
  await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
  const directory = await mkdtemp(
    new URL("../artifacts/preferences-", import.meta.url),
  );
  const filename = directory + "/preferences.json";
  let app = await start({
    preferenceStore: createFilePreferenceStore(filename),
  });
  const prefs = {
    guest: publicProjects.map((project) => project.id).reverse(),
    personal: [protectedFixture.id],
    pinned: [publicProjects[0].id, protectedFixture.id],
  };
  try {
    assert.equal((await fetch(app.origin + "/api/preferences")).status, 401);
    const login = await app.login();
    const cookie = sessionCookie(login);
    const put = (origin, body) =>
      fetch(app.origin + "/api/preferences", {
        method: "PUT",
        headers: {
          Cookie: cookie,
          Origin: origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: body }),
      });
    assert.equal((await put("https://untrusted.example", prefs)).status, 403);
    assert.equal((await put(app.origin, { guest: "invalid" })).status, 400);
    assert.equal((await put(app.origin, prefs)).status, 200);
    assert.equal(
      (await (await fetch(app.origin + "/api/projects")).json()).preferences,
      undefined,
    );
    await app.close();
    app = await start({ preferenceStore: createFilePreferenceStore(filename) });
    const reopened = await (await app.login()).json();
    assert.deepEqual(reopened.preferences, prefs);
  } finally {
    await app.close();
  }
});
