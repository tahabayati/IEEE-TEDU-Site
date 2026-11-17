import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDatabase } from "./mongodb.mjs";
import { hashPassword, verifyPassword } from "./password.mjs";

const COOKIE = "ieee_admin";
const SESSION_DAYS = 7;

// Indexes are idempotent; create them once per server instance.
let indexes;
async function collections() {
  const db = await getDatabase();
  const admins = db.collection("admins");
  const sessions = db.collection("admin_sessions");
  indexes ??= Promise.all([
    admins.createIndex({ username: 1 }, { unique: true }),
    sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    sessions.createIndex({ adminId: 1 }),
  ]).catch((error) => { indexes = null; throw error; });
  await indexes;
  return { admins, sessions };
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

// Same work whether or not the username exists, so timing does not reveal valid usernames.
const DUMMY_HASH = "scrypt:00000000000000000000000000000000:" + "0".repeat(128);

export async function login(username, password) {
  const { admins, sessions } = await collections();
  const admin = await admins.findOne({ username });
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) return false;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await sessions.insertOne({ tokenHash: sha256(token), adminId: admin._id, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
  return true;
}

export async function logout() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await (await collections()).sessions.deleteOne({ tokenHash: sha256(token) });
  store.delete({ name: COOKIE, path: "/admin" });
}

// Returns { _id, username, role, description } or null. Re-reads the admin each request,
// so deleting an admin or changing a role takes effect immediately.
export async function getCurrentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { admins, sessions } = await collections();
  const session = await sessions.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return admins.findOne({ _id: session.adminId }, { projection: { passwordHash: 0 } });
}

// Chief-only management of "admin" accounts. Chief accounts are managed in the database directly.
export async function listAdmins() {
  const { admins } = await collections();
  return admins.find({ role: "admin" }, { projection: { passwordHash: 0 } }).sort({ username: 1 }).toArray();
}

export async function createAdmin({ username, description, password }) {
  const { admins } = await collections();
  await admins.insertOne({
    username, description, role: "admin",
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
  });
}

export async function updateAdmin(id, { username, description, password }) {
  const { admins, sessions } = await collections();
  const _id = new ObjectId(id);
  const set = { username, description, updatedAt: new Date() };
  if (password) set.passwordHash = await hashPassword(password);
  const { matchedCount } = await admins.updateOne({ _id, role: "admin" }, { $set: set });
  if (matchedCount && password) await sessions.deleteMany({ adminId: _id });
  return matchedCount > 0;
}

export async function deleteAdmin(id) {
  const { admins, sessions } = await collections();
  const _id = new ObjectId(id);
  const { deletedCount } = await admins.deleteOne({ _id, role: "admin" });
  if (deletedCount) await sessions.deleteMany({ adminId: _id });
}
