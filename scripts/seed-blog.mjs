// One-off migration of the original five static posts into MongoDB. Safe to re-run:
// existing slugs are left alone, so admin edits are never overwritten.
import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { getDatabase, closeMongoClient } from "../lib/mongodb.mjs";

nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)), true, { info() {}, error() {} });
const posts = JSON.parse(readFileSync(new URL("./blog-seed.json", import.meta.url), "utf8"));

try {
  const col = (await getDatabase()).collection("posts");
  await col.createIndex({ slug: 1 }, { unique: true });
  const now = Date.now();
  for (const [i, p] of posts.entries()) {
    // Earlier in the list = newer, which keeps the original order on the site.
    const r = await col.updateOne({ slug: p.slug }, { $setOnInsert: {
      ...p, date: new Date(Date.UTC(2026, 9, 24)), coverKey: null, published: true, createdAt: new Date(now - i * 1000),
    } }, { upsert: true });
    console.log(`${r.upsertedCount ? "added  " : "exists "} ${p.slug}`);
  }
} finally {
  await closeMongoClient();
}
