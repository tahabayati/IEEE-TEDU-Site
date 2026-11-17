// Usage: npm run hash-password
// Prints a passwordHash to paste into the "admins" collection (e.g. for the chief, via Compass).
import { createInterface } from "node:readline/promises";
import { hashPassword, verifyPassword } from "../lib/password.mjs";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question("Password: ");
rl.close();
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
const hash = await hashPassword(password);
if (!(await verifyPassword(password, hash))) throw new Error("hash self-check failed");
console.log(`\npasswordHash:\n${hash}`);
