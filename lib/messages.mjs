import "server-only";
import { getDatabase } from "./mongodb.mjs";

/*
messages: { _id, name, email, message, status: "new"|"checking"|"done", createdAt, ipHash }
*/

export const STATUSES = ["new", "checking", "done"];
export const PAGE_SIZE = 10;

let indexes;
export async function messagesCollection() {
  const col = (await getDatabase()).collection("messages");
  indexes ??= Promise.all([
    col.createIndex({ createdAt: -1 }),
    col.createIndex({ status: 1, createdAt: -1 }),
    col.createIndex({ ipHash: 1, createdAt: -1 }),
  ]).catch((e) => { indexes = null; throw e; });
  await indexes;
  return col;
}

// One page of messages, newest first. Returns { items, total, pages, page } with page clamped to range.
export async function listMessages({ status, page }) {
  const col = await messagesCollection();
  const filter = STATUSES.includes(status) ? { status } : {};
  const total = await col.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number.parseInt(page, 10) || 1), pages);
  const items = await col.find(filter, { projection: { ipHash: 0 } }).sort({ createdAt: -1 })
    .skip((current - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray();
  return { items, total, pages, page: current };
}
