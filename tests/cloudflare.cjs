const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Miniflare, convertV4MiniflareOptions } = require("miniflare");

(async () => {
  const { testAuth, testPassword } = await import("./fixtures.js");
  const { default: guestProjects } = await import("../assets/js/projects.js");
  const { isGuestVisible } = await import("../assets/js/project-access.js");
  const root = path.resolve(__dirname, "..");
  const state = fs.mkdtempSync(path.join(root, "artifacts/cf-state-"));
  const options = convertV4MiniflareOptions({
    resourcePersistencePath: state,
    cf: false,
    workers: [
      {
        name: "homepage",
        modules: true,
        scriptPath: path.join(root, "artifacts/homepage-build/homepage.js"),
        compatibilityDate: "2026-09-01",
        compatibilityFlags: ["nodejs_compat"],
        durableObjects: {
          PORTFOLIO_ACCOUNT: {
            className: "PortfolioAccount",
            scriptName: "gyagp-home",
            useSQLite: true,
          },
        },
        assets: {
          directory: path.join(root, "dist"),
          binding: "ASSETS",
          run_worker_first: ["/api/*"],
          routerConfig: { has_user_worker: true },
        },
      },
      {
        name: "gyagp-home",
        modules: true,
        scriptPath: path.join(root, "artifacts/legacy-build/legacy.js"),
        compatibilityDate: "2026-09-01",
        compatibilityFlags: ["nodejs_compat"],
        bindings: { AUTH_CONFIG: JSON.stringify(testAuth) },
        durableObjects: {
          PORTFOLIO_ACCOUNT: { className: "PortfolioAccount", useSQLite: true },
        },
      },
    ],
  });
  let mf = new Miniflare(options);
  const origin = "https://portfolio.example";
  const request = (route, options) => mf.dispatchFetch(origin + route, options);
  const login = (username = "gyagp", password = testPassword) =>
    request("/api/login", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  try {
    const publicResponse = await request("/api/projects");
    assert.equal(
      publicResponse.status,
      200,
      await publicResponse.clone().text(),
    );
    const guest = await publicResponse.json();
    assert.equal(guest.projects.length, guestProjects.length);
    assert.ok(guest.projects.every(isGuestVisible));
    assert.ok(
      guest.projects
        .filter((project) => project.visibility !== "public")
        .every((project) => !project.repo),
    );
    assert.equal((await request("/api/preferences")).status, 401);
    assert.equal((await request("/api/private-projects")).status, 401);
    assert.equal((await login("not-gyagp")).status, 401);
    assert.equal((await login("gyagp", "wrong")).status, 401);
    const response = await login();
    assert.equal(response.status, 200, await response.clone().text());
    const owner = await response.json();
    assert.ok(owner.projects.length > guest.projects.length);
    const extra = owner.projects.filter((project) => !isGuestVisible(project));
    assert.ok(
      extra.some((project) => project.release?.access === "enterprise"),
    );
    const session = response.headers.get("set-cookie").split(";")[0];
    assert.match(response.headers.get("set-cookie"), /HttpOnly/);
    assert.match(response.headers.get("set-cookie"), /Secure/);
    const prefs = {
      guest: [...guest.projects].reverse().map((project) => project.id),
      personal: [...extra].reverse().map((project) => project.id),
      pinned: [guest.projects.at(-1).id, extra.at(-1).id],
    };
    const save = await request("/api/preferences", {
      method: "PUT",
      headers: {
        Cookie: session,
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferences: prefs }),
    });
    assert.equal(save.status, 200);
    assert.deepEqual((await save.json()).preferences, prefs);
    const crossSite = await request("/api/preferences", {
      method: "PUT",
      headers: {
        Cookie: session,
        Origin: "https://other.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferences: prefs }),
    });
    assert.equal(crossSite.status, 403);
    for (const route of [
      "/.private/auth.json",
      "/.private/projects.json",
      "/cloudflare/worker.js",
      "/worker.js",
      "/artifacts/worker-build/worker.js",
    ]) {
      assert.equal((await request(route)).status, 404, route);
    }
    assert.equal((await request("/")).status, 200);
    const legacy = await mf.getWorker("gyagp-home");
    const moved = await legacy.fetch(
      "https://gyagp-home.gyagp.workers.dev/projects?lang=en",
      { redirect: "manual" },
    );
    assert.equal(moved.status, 308);
    assert.equal(
      moved.headers.get("location"),
      "https://homepage.gyagp.workers.dev/projects?lang=en",
    );
    const staleMutation = await legacy.fetch(
      "https://gyagp-home.gyagp.workers.dev/api/preferences",
      { method: "PUT" },
    );
    assert.equal(staleMutation.status, 409);
    await mf.dispose();
    mf = new Miniflare(options);
    const recovered = await (
      await request("/api/projects", { headers: { Cookie: session } })
    ).json();
    assert.equal(
      recovered.authenticated,
      true,
      "Session survives runtime restart",
    );
    assert.deepEqual(
      recovered.preferences,
      prefs,
      "Preferences survive SQLite/runtime restart",
    );
    const logout = await request("/api/logout", {
      method: "POST",
      headers: { Cookie: session, Origin: origin },
    });
    assert.equal(logout.status, 200);
    assert.equal(
      (await request("/api/preferences", { headers: { Cookie: session } }))
        .status,
      401,
    );
    const next = await login();
    assert.deepEqual(
      (await next.json()).preferences,
      prefs,
      "Preferences survive signing out and back in",
    );
    console.log(
      "PASS: cross-Worker account binding, old-address redirects, authentication, guest/private separation, protected assets, persistent sessions and preference recovery after runtime restart and re-login.",
    );
  } finally {
    await mf.dispose();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
