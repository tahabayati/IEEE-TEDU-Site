// No "server-only" here: scripts/hash-password.mjs imports this from the command line.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Stored format: scrypt:<salt hex>:<64-byte key hex>
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, keyHex] = String(stored).split(":");
  if (scheme !== "scrypt" || !salt || keyHex?.length !== 128) return false;
  const key = await scryptAsync(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(keyHex, "hex"));
}
