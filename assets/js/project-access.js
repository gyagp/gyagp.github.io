// Project visibility and repository visibility are separate decisions.
export function compareProjectUpdates(a, b) {
  const timestamp = (project) => {
    const value = Date.parse(project.updatedAt);
    return Number.isFinite(value) ? value : -Infinity;
  };
  return (
    timestamp(b) - timestamp(a) ||
    (a.order ?? 0) - (b.order ?? 0) ||
    a.id.localeCompare(b.id)
  );
}

export function isPublished(project) {
  const release = project.release;
  if (!release || !["web", "download"].includes(release.kind)) return false;
  if (
    !["public", "account", "registration", "restricted", "webgpu"].includes(
      release.access,
    )
  )
    return false;
  try {
    return new URL(release.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function isGuestVisible(project) {
  return project.visibility === "public" || isPublished(project);
}

export function toGuestProject(project) {
  // Only presentation metadata is delivered to visitors, even for published apps.
  const result = {};
  for (const key of [
    "id",
    "order",
    "art",
    "category",
    "visibility",
    "name",
    "subtitle",
    "description",
    "tags",
    "release",
    "releaseState",
    "future",
    "createdAt",
    "updatedAt",
  ]) {
    if (project[key] !== undefined) result[key] = project[key];
  }
  if (project.visibility === "public") {
    if (project.repo) result.repo = project.repo;
    if (project.futureSource) result.futureSource = project.futureSource;
  }
  return result;
}

export function normalizePreferences(input, projects) {
  if (
    !input ||
    !["guest", "personal", "pinned"].every(
      (key) =>
        Array.isArray(input[key]) &&
        input[key].length <= 1000 &&
        input[key].every((id) => typeof id === "string" && id.length <= 200),
    )
  ) {
    throw new Error("Invalid project preferences.");
  }
  const byId = new Map(projects.map((project) => [project.id, project]));
  const unique = (list) => [...new Set(list)].filter((id) => byId.has(id));
  return {
    guest: unique(input.guest).filter((id) => isGuestVisible(byId.get(id))),
    personal: unique(input.personal).filter(
      (id) => !isGuestVisible(byId.get(id)),
    ),
    pinned: unique(input.pinned),
  };
}
