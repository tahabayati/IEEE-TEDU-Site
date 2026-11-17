import "server-only";
import { getDatabase } from "./mongodb.mjs";

/*
posts: { _id, slug, title, category, color, excerpt, body, date: Date (UTC midnight, shown on site),
         coverKey: string|null, published: bool, createdAt }
body is plain text; blank lines separate paragraphs.
*/

export const COLORS = ["peach", "blue", "purple", "green", "pink"];

let indexes;
export async function postsCollection() {
  const posts = (await getDatabase()).collection("posts");
  indexes ??= posts.createIndex({ slug: 1 }, { unique: true }).catch((e) => { indexes = null; throw e; });
  await indexes;
  return posts;
}

// "24 Eki 2026". Dates are stored as UTC midnight, so format in UTC to avoid day shifts.
export const formatDate = (d) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);

export const paragraphs = (body) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const newestFirst = { date: -1, createdAt: -1 };

export async function getPublishedPosts(limit = 0) {
  return (await postsCollection()).find({ published: true }).sort(newestFirst).limit(limit).toArray();
}

export async function getPublishedPost(slug) {
  return (await postsCollection()).findOne({ slug, published: true });
}

export async function getAllPosts() {
  return (await postsCollection()).find().sort(newestFirst).toArray();
}
