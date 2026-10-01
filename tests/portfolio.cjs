const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const { createPortfolioServer } = await import("../server/app.js");
  const { testAuth, testPassword, protectedFixture } = await import(
    "./fixtures.js"
  );
  const { default: publicProjects } = await import("../assets/js/projects.js");
  const server = createPortfolioServer({
    auth: testAuth,
    privateProjects: [protectedFixture],
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const output = path.resolve(__dirname, "../artifacts");
  fs.mkdirSync(output, { recursive: true });
  const count = publicProjects.length;
  const errors = [];
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      channel: process.env.PLAYWRIGHT_BROWSER || undefined,
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
      locale: "zh-CN",
      reducedMotion: "reduce",
      permissions: ["clipboard-read", "clipboard-write"],
      bypassCSP: Boolean(process.env.AXE_CORE_MODULE),
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      const expectedLoginFailure =
        message.location().url.endsWith("/api/login") &&
        message.text().includes("401");
      if (message.type() === "error" && !expectedLoginFailure)
        errors.push(message.text() + " " + message.location().url);
    });
    await page.goto(base + "/?lang=zh");
    await page.waitForSelector(".project-card");
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
    assert.equal(await page.locator(".project-card").count(), count);
    assert.equal(
      await page.locator(".visibility.private").count(),
      publicProjects.filter((project) => project.visibility === "private")
        .length,
    );
    assert.equal(
      await page.locator("#project-grid .project-card").count(),
      count,
    );
    assert.equal(await page.locator("#personal-projects").isVisible(), false);
    assert.equal(await page.locator("#project-jigefen .repo-link").count(), 0);
    assert.equal(
      await page.locator("#project-fingoo .release-link").getAttribute("href"),
      "https://fingoo.gyagp.workers.dev/",
    );
    assert.equal(await page.locator("#project-protected-fixture").count(), 0);
    assert.equal(
      await page.locator("#project-total").innerText(),
      String(count).padStart(2, "0"),
    );
    assert.equal(
      await page
        .locator("#project-rubiks-cube .repo-link")
        .getAttribute("href"),
      "https://github.com/webgfx/rubiks-cube",
    );
    assert.equal(
      await page
        .locator("#project-online-toolkit .release-link")
        .getAttribute("href"),
      "https://webgfx.github.io/online-toolkit/",
    );
    assert.match(
      await page.locator("#project-aquarium-web .release-note").innerText(),
      /WebGPU/,
    );
    assert.equal(
      await page
        .locator("#project-handwriting .release-link")
        .getAttribute("href"),
      "https://handwriting-3pw0h8r36-gyagps-projects.vercel.app/",
    );
    await page.locator("#project-search").fill("protected-fixture");
    assert.equal(await page.locator(".project-card").count(), 0);
    await page.locator("#reset-filters").click();
    await page.evaluate(() => {
      localStorage.setItem("user", "gyagp");
      localStorage.setItem("authenticated", "true");
    });
    await page.reload();
    assert.equal(
      await page.locator(".project-card").count(),
      count,
      "Local storage cannot grant access",
    );
    assert.equal(
      (await context.request.get(base + "/api/private-projects")).status(),
      401,
    );

    for (const category of ["tools", "learning", "games", "graphics", "all"]) {
      await page.locator('[data-filter="' + category + '"]').click();
      assert.equal(
        await page.locator(".project-card").count(),
        publicProjects.filter(
          (p) => category === "all" || p.category === category,
        ).length,
      );
    }
    await page.locator('[data-filter="learning"]').click();
    await page.locator("#project-search").fill("书法");
    await page.locator('[data-language="en"]').click();
    assert.equal(
      await page.locator(".project-card .project-title").innerText(),
      "Handwriting",
    );
    assert.equal(await page.locator("#project-search").inputValue(), "书法");
    await page.locator("#project-handwriting summary").click();
    await page.waitForFunction(
      () => document.querySelector("#project-handwriting details").open,
    );
    await page.locator('[data-language="zh"]').click();
    assert.equal(
      await page.locator("#project-handwriting details").getAttribute("open"),
      "",
    );
    await page
      .locator("#project-search")
      .fill("<script>not-a-project</script>");
    assert.equal(await page.locator("#empty-state").isVisible(), true);
    await page.locator("#reset-filters").click();
    assert.equal(await page.locator(".project-card").count(), count);
    await page.locator("#project-handwriting summary").click();
    await page.locator("#project-online-toolkit summary").click();
    assert.equal(
      await page.locator("#project-online-toolkit .future-body li").count(),
      3,
    );
    assert.equal(
      await page
        .locator("#project-online-toolkit .future-source")
        .getAttribute("href"),
      "https://github.com/webgfx/online-toolkit#readme",
    );
    await page.locator("#project-online-toolkit summary").click();

    const cardOrder = () =>
      page
        .locator("#project-grid .project-card")
        .evaluateAll((cards) => cards.map((card) => card.id));
    const defaultOrder = await cardOrder();
    const firstId = defaultOrder[0];
    await page.locator("#" + firstId + " [data-order-down]").click();
    assert.equal(
      (await cardOrder())[1],
      firstId,
      "Arrow controls reorder visible projects",
    );
    await page.reload();
    assert.equal((await cardOrder())[1], firstId, "Order survives refresh");
    const dragTarget = (await cardOrder())[3];
    await page.setViewportSize({ width: 1440, height: 2200 });
    await page.locator("#" + firstId).hover();
    const handleBounds = await page
      .locator("#" + firstId + " [data-drag-project]")
      .boundingBox();
    const targetBounds = await page.locator("#" + dragTarget).boundingBox();
    const startX = handleBounds.x + handleBounds.width / 2;
    const startY = handleBounds.y + handleBounds.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 15, startY + 15, { steps: 5 });
    await page.mouse.move(
      targetBounds.x + targetBounds.width / 2,
      targetBounds.y + targetBounds.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();
    assert.equal(
      (await cardOrder())[3],
      firstId,
      "Drag handle reorders the grid",
    );
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.locator("#project-fingoo").hover();
    await page.locator("#project-fingoo [data-pin-project]").click();
    assert.equal((await cardOrder())[0], "project-fingoo");
    assert.equal(
      await page
        .locator("#project-fingoo [data-pin-project]")
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.reload();
    assert.equal(
      (await cardOrder())[0],
      "project-fingoo",
      "Pin survives refresh",
    );
    await page.locator('[data-language="en"]').click();
    assert.equal(
      (await cardOrder())[0],
      "project-fingoo",
      "Language does not change pinning",
    );
    await page.locator('[data-filter="learning"]').click();
    assert.equal(
      (await cardOrder())[0],
      "project-fingoo",
      "Pin stays at the top of filtered results",
    );
    await page.locator('[data-filter="all"]').click();
    await page.locator('[data-language="zh"]').click();
    const visitorOrder = await cardOrder();
    // Unknown IDs in saved preferences do not grant access to protected projects.
    await page.evaluate(() => {
      const key = "portfolio-project-order:guest";
      const prefs = JSON.parse(localStorage.getItem(key));
      prefs.pinned.push("protected-fixture");
      prefs.personal = ["protected-fixture"];
      localStorage.setItem(key, JSON.stringify(prefs));
    });
    await page.reload();
    assert.equal(await page.locator("#project-protected-fixture").count(), 0);
    assert.equal(await page.locator("#personal-projects").isVisible(), false);

    await page.locator("#auth-button").click();
    assert.equal(await page.locator("#login-dialog").isVisible(), true);
    await page.locator("#login-username").fill("someone-else");
    await page.locator("#login-password").fill(testPassword);
    await page.locator("#login-submit").click();
    await page.waitForSelector("#login-error:visible");
    assert.match(await page.locator("#login-error").innerText(), /不正确/);
    assert.equal(await page.locator(".project-card").count(), count);
    await page.locator("#login-username").fill("gyagp");
    await page.locator("#login-password").fill("wrong-password");
    await page.locator("#login-submit").click();
    await page.waitForSelector("#login-error:visible");
    assert.equal(await page.locator(".project-card").count(), count);
    await page.locator("#login-password").fill(testPassword);
    await page.locator("#login-submit").click();
    await page.waitForSelector("#project-protected-fixture");
    assert.equal(await page.locator("#login-dialog").isVisible(), false);
    assert.equal(await page.locator("#login-password").inputValue(), "");
    assert.equal(await page.locator(".project-card").count(), count + 1);
    assert.equal(
      await page.locator("#project-grid .project-card").count(),
      count,
    );
    assert.equal(
      await page.locator("#personal-project-grid .project-card").count(),
      1,
    );
    assert.equal(
      await page
        .locator("#personal-project-grid #project-protected-fixture")
        .count(),
      1,
    );
    assert.deepEqual(
      await cardOrder(),
      defaultOrder,
      "Administrator preferences are separate from visitor preferences",
    );
    await page.locator("#project-protected-fixture").hover();
    await page.locator("#project-protected-fixture [data-pin-project]").click();
    assert.equal(
      await page.locator("#personal-project-grid .is-pinned").count(),
      1,
    );
    assert.equal(
      await page.locator("#project-grid #project-protected-fixture").count(),
      0,
      "Pinning cannot move a private project into the visitor section",
    );
    await page.locator("#project-search").fill("protected-fixture");
    assert.equal(await page.locator("#project-grid .project-card").count(), 0);
    assert.equal(
      await page.locator("#personal-project-grid .project-card").count(),
      1,
    );
    assert.equal(await page.locator("#guest-projects-empty").isVisible(), true);
    await page.locator("#project-search").fill("");
    await page.locator("#project-online-toolkit").hover();
    await page.locator("#project-online-toolkit [data-pin-project]").click();
    assert.equal((await cardOrder())[0], "project-online-toolkit");
    await page.waitForFunction(
      () =>
        document.querySelector("#order-save-status").textContent ===
        "已保存到服务器",
    );
    assert.equal(await page.locator("#auth-user").isVisible(), true);
    assert.equal(
      await page
        .locator("#project-protected-fixture .repo-link")
        .getAttribute("href"),
      protectedFixture.repo,
    );
    assert.ok(
      !(await page.evaluate(() => document.cookie)).includes(
        "portfolio_session",
      ),
    );
    const session = (await context.cookies()).find(
      (cookie) => cookie.name === "portfolio_session",
    );
    assert.equal(session.httpOnly, true);
    assert.equal(session.sameSite, "Strict");
    await page.reload();
    await page.waitForSelector("#project-protected-fixture");
    assert.equal((await cardOrder())[0], "project-online-toolkit");
    assert.equal(
      await page.locator("#personal-project-grid .is-pinned").count(),
      1,
    );
    const otherDevice = await browser.newContext({ locale: "en-US" });
    const devicePage = await otherDevice.newPage();
    await devicePage.goto(base + "/?lang=en");
    assert.equal(
      await devicePage.locator("#personal-projects").isVisible(),
      false,
    );
    await devicePage.locator("#auth-button").click();
    await devicePage.locator("#login-password").fill(testPassword);
    await devicePage.locator("#login-submit").click();
    await devicePage.waitForSelector("#project-protected-fixture");
    assert.equal(
      await devicePage
        .locator("#project-grid .project-card")
        .first()
        .getAttribute("id"),
      "project-online-toolkit",
      "An independent browser restores server preferences",
    );
    assert.equal(
      await devicePage.locator("#personal-project-grid .is-pinned").count(),
      1,
    );
    assert.equal(
      await devicePage.evaluate(() =>
        localStorage.getItem("portfolio-project-order:gyagp"),
      ),
      null,
    );
    await otherDevice.close();
    await page.bringToFront();
    const otherTab = await context.newPage();
    await otherTab.goto(base + "/?lang=en");
    await otherTab.waitForSelector("#project-protected-fixture");
    await otherTab.locator("#auth-button").click();
    await page.waitForFunction(
      () => !document.querySelector("#project-protected-fixture"),
    );
    assert.equal(
      await page.locator(".project-card").count(),
      count,
      "Other tabs hide protected data on logout",
    );
    assert.equal(await page.locator("#personal-projects").isVisible(), false);
    assert.deepEqual(
      await cardOrder(),
      visitorOrder,
      "Logout restores visitor ordering and pins",
    );
    await page.locator("#project-fingoo [data-pin-project]").click();
    assert.equal(
      await page.locator("#project-fingoo .pinned-label").count(),
      0,
    );
    await page.locator("#reset-order").click();
    assert.deepEqual(await cardOrder(), defaultOrder);
    assert.equal(
      (await context.request.get(base + "/api/private-projects")).status(),
      401,
    );
    await otherTab.close();
    await page.bringToFront();

    await page.locator('[data-language="en"]').click();
    await page.reload();
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    await page.goto(base);
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    await page.locator("#copy-email").click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "gyagp0@gmail.com",
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("Test denial")) },
      }),
    );
    await page.locator("#copy-email").click();
    assert.match(await page.locator("#toast").innerText(), /manually/);
    assert.equal(
      (await page.evaluate(() => getSelection().toString())).trim(),
      "gyagp0@gmail.com",
    );

    for (const language of ["zh", "en"]) {
      await page.goto(base + "/?lang=" + language);
      if (process.env.AXE_CORE_MODULE)
        await page.addScriptTag({ path: process.env.AXE_CORE_MODULE });
      for (const width of [320, 360, 390, 600, 768, 850, 1024, 1440]) {
        await page.setViewportSize({ width, height: width < 600 ? 844 : 1050 });
        const layout = await page.evaluate(() => ({
          width: innerWidth,
          document: document.documentElement.scrollWidth,
          cards: [...document.querySelectorAll(".project-card")].map(
            (card) => ({ width: card.clientWidth, scroll: card.scrollWidth }),
          ),
        }));
        assert.ok(
          layout.document <= layout.width,
          "Overflow " + language + " " + width + ": " + JSON.stringify(layout),
        );
        assert.ok(
          layout.cards.every((card) => card.scroll <= card.width + 1),
          "Card overflow " + language + " " + width,
        );
        if ([390, 768, 1440].includes(width))
          await page.screenshot({
            path: path.join(
              output,
              (width === 390
                ? "mobile"
                : width === 768
                  ? "tablet"
                  : "desktop") +
                "-" +
                language +
                ".png",
            ),
            fullPage: true,
          });
        if ([390, 1440].includes(width)) {
          await page.locator("#auth-button").click();
          const modal = await page.locator("#login-dialog").boundingBox();
          assert.ok(
            modal.x >= 0 && modal.x + modal.width <= width,
            "Sign-in modal fits",
          );
          if (process.env.AXE_CORE_MODULE) {
            const violations = await page.evaluate(async () =>
              (
                await axe.run(document, {
                  runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21aa"],
                  },
                })
              ).violations.map((v) => ({
                id: v.id,
                targets: v.nodes.map((n) => n.target),
              })),
            );
            assert.deepEqual(
              violations,
              [],
              language + " sign-in accessibility " + width,
            );
          }
          await page.screenshot({
            path: path.join(output, "login-" + language + "-" + width + ".png"),
          });
          await page.keyboard.press("Escape");
          assert.equal(await page.locator("#login-dialog").isVisible(), false);
          if (process.env.AXE_CORE_MODULE) {
            const violations = await page.evaluate(async () =>
              (
                await axe.run(document, {
                  runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21aa"],
                  },
                })
              ).violations.map((v) => ({
                id: v.id,
                targets: v.nodes.map((n) => n.target),
              })),
            );
            assert.deepEqual(
              violations,
              [],
              language + " accessibility " + width,
            );
          }
        }
      }
    }
    await page.goto(base + "/projects.html");
    await page.waitForURL("**/#projects");
    assert.equal(await page.locator(".project-card").count(), count);
    await page.goto(base + "/links.html");
    await page.waitForURL("**/#contact");
    await page.goto(base + "/?lang=en");
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".skip-link")
        .evaluate((e) => document.activeElement === e),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(new URL(page.url()).hash, "#projects");
    await page.locator("#project-tank summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator("#project-tank details").getAttribute("open"),
      "",
    );
    const noStorage = await browser.newContext({ locale: "en-US" });
    await noStorage.addInitScript(() =>
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("Storage disabled");
        },
      }),
    );
    const storagePage = await noStorage.newPage();
    await storagePage.goto(base + "/?lang=invalid");
    assert.equal(await storagePage.locator("html").getAttribute("lang"), "en");
    await storagePage.locator('[data-language="zh"]').click();
    assert.equal(await storagePage.locator(".project-card").count(), count);
    await storagePage.locator("#project-fingoo").hover();
    await storagePage.locator("#project-fingoo [data-pin-project]").click();
    assert.equal(
      await storagePage
        .locator("#project-grid .project-card")
        .first()
        .getAttribute("id"),
      "project-fingoo",
      "Pinning works in memory when storage is blocked",
    );
    const noScript = await browser.newContext({ javaScriptEnabled: false });
    const noScriptPage = await noScript.newPage();
    await noScriptPage.goto(base);
    assert.equal(
      await noScriptPage.locator(".noscript-projects li").count(),
      count,
    );
    assert.ok(!(await noScriptPage.content()).includes(protectedFixture.repo));
    assert.deepEqual(errors, [], "No unexpected browser errors");
    console.log(
      "PASS: guest visibility and separate admin section; private code redaction; drag/arrow ordering; pin/unpin and persistence; isolated visitor/admin preferences; authentication, logout, keyboard, 16 responsive layouts, and fallbacks.",
    );
    if (process.env.AXE_CORE_MODULE)
      console.log(
        "PASS: desktop/mobile bilingual accessibility, including sign-in dialogs.",
      );
    console.log("Screenshots: " + output);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
