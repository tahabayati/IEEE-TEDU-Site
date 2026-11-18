// Loads workshop content from /content/workshops, hides unpublished items, sorts by `order`
// and validates it. A mistake in the content throws with a readable message, so it fails the
// build (the live site keeps serving the previous deployment) instead of shipping a broken link.
import { WORKSHOPS } from "../content/workshops/index.mjs";

const byOrder = (items) =>
  items
    .map((item, i) => [item, i])
    .filter(([item]) => item.published !== false)
    .sort(([a, i], [b, j]) => (a.order ?? Infinity) - (b.order ?? Infinity) || i - j)
    .map(([item]) => item);

// https/http links or a local path inside /public (but not protocol-relative "//host").
function isSafeUrl(url) {
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    return ["https:", "http:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function youtubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m)\./, "");
    const id = host === "youtu.be" ? u.pathname.slice(1) : host === "youtube.com" || host === "youtube-nocookie.com"
      ? u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]
      : null;
    return /^[\w-]{11}$/.test(id || "") ? id : null;
  } catch {
    return null;
  }
}

function check(slug, kind, item, seen) {
  const where = `[workshop "${slug}"] ${kind} "${item.id ?? item.title ?? "?"}"`;
  if (!item.id || !(item.title || item.name)) throw new Error(`${where}: "id" and "title" (or "name") are required`);
  if (seen.has(item.id)) throw new Error(`${where}: duplicate id`);
  seen.add(item.id);
  return where;
}

function prepare(w) {
  const slug = w.slug;
  if (!/^[a-z0-9-]+$/.test(slug || "")) throw new Error(`Workshop slug "${slug}" must be lowercase letters, digits and dashes`);

  const seenTools = new Set();
  const tools = byOrder(w.tools ?? []).map((t) => {
    const where = check(slug, "tool", t, seenTools);
    if (!t.url || !isSafeUrl(t.url)) throw new Error(`${where}: invalid or missing url`);
    const videos = Object.fromEntries(Object.entries(t.videos ?? {}).map(([os, v]) => {
      const id = youtubeId(v.url);
      if (!id) throw new Error(`${where}: videos.${os} is not a recognisable YouTube URL`);
      return [os, { ...v, id }];
    }));
    return { status: "recommended", platforms: [], install: {}, ...t, videos };
  });

  const seenRes = new Set();
  const resources = byOrder(w.resources ?? []).map((r) => {
    const where = check(slug, "resource", r, seenRes);
    if (!r.type) throw new Error(`${where}: "type" is required`);
    if (r.url ? !isSafeUrl(r.url) : !r.comingSoon) throw new Error(`${where}: needs a valid url (or comingSoon: true)`);
    const videoId = r.type === "youtube" && r.url ? youtubeId(r.url) : null;
    if (r.type === "youtube" && r.url && !videoId) throw new Error(`${where}: not a recognisable YouTube URL`);
    return { requirement: "supplementary", phase: "workshop", category: "other", videoId, ...r };
  });

  const categories = [...byOrder(w.categories ?? [])];
  if (resources.some((r) => !categories.some((c) => c.id === r.category))) categories.push({ id: "other", label: "Other" });

  const seenEx = new Set();
  const exercises = byOrder(w.exercises ?? []).map((e) => {
    const where = check(slug, "exercise", e, seenEx);
    for (const key of ["starterUrl", "solutionUrl"]) if (e[key] && !isSafeUrl(e[key])) throw new Error(`${where}: invalid ${key}`);
    return e;
  });

  return {
    ...w,
    tools,
    categories,
    agenda: byOrder(w.agenda ?? []),
    resources: resources.filter((r) => r.phase !== "further"),
    furtherResources: resources.filter((r) => r.phase === "further"),
    exercises,
  };
}

export const getWorkshopSlugs = () => WORKSHOPS.filter((w) => w.published !== false).map((w) => w.slug);

export function getWorkshop(slug) {
  const w = WORKSHOPS.find((x) => x.slug === slug && x.published !== false);
  return w ? prepare(w) : null;
}

export const getWorkshopList = () =>
  WORKSHOPS.filter((w) => w.published !== false).map(({ slug, title, summary }) => ({ slug, title, summary }));
