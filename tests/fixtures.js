import { scryptSync } from "node:crypto";

// Synthetic test credentials and metadata, unrelated to the real administrator.
export const testPassword = "test-fixture-only-89!";
const salt = "ab".repeat(32);
export const testAuth = {
  username: "gyagp",
  salt,
  passwordHash: scryptSync(testPassword, salt, 64).toString("hex"),
};
export const protectedFixture = {
  id: "protected-fixture",
  order: 99,
  art: "reading",
  category: "learning",
  visibility: "private",
  name: { zh: "受保护的测试项目", en: "Protected test project" },
  subtitle: "SYNTHETIC TEST DATA",
  description: {
    zh: "仅用于验证访问控制的合成资料。",
    en: "Synthetic metadata used to verify access control.",
  },
  tags: { zh: ["测试"], en: ["Test"] },
  repo: "https://example.invalid/protected-fixture",
  release: null,
  releaseState: "private",
  future: { zh: [], en: [] },
};
export const publishedFixture = {
  ...protectedFixture,
  id: "published-private-fixture",
  order: 100,
  name: { zh: "已发布的测试项目", en: "Published test project" },
  repo: "https://example.invalid/private-source",
  release: {
    url: "https://example.invalid/live-app",
    kind: "web",
    access: "account",
  },
  futureSource: "https://example.invalid/private-source#notes",
  internalNotes: "Never deliver internal notes to a visitor.",
};
export const enterpriseFixture = {
  ...protectedFixture,
  id: "enterprise-fixture",
  order: 101,
  visibility: "restricted",
  release: {
    url: "https://example.invalid/team-portal",
    kind: "web",
    access: "enterprise",
  },
};
