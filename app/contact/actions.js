"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { messagesCollection } from "../../lib/messages.mjs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_HOUR = 5;

// useActionState action: returns { ok } or { error } (Turkish, shown to the visitor).
export async function sendMessageAction(_prev, form) {
  const text = (n) => String(form.get(n) ?? "").trim();
  // Hidden "website" field: humans leave it empty, bots fill it. Pretend success so they do not retry.
  if (text("website")) return { ok: true };

  const name = text("name");
  const email = text("email");
  const message = text("message");
  if (!name || name.length > 100) return { error: "Lütfen adınızı girin." };
  if (!EMAIL.test(email) || email.length > 200) return { error: "Geçerli bir e-posta adresi girin." };
  if (message.length < 5 || message.length > 5000) return { error: "Mesajınız 5-5000 karakter arasında olmalı." };

  // Only a hash of the IP is stored, enough to rate limit without keeping the address.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const col = await messagesCollection();
  const recent = await col.countDocuments({ ipHash, createdAt: { $gt: new Date(Date.now() - 3600_000) } });
  if (recent >= MAX_PER_HOUR) return { error: "Çok fazla mesaj gönderdiniz. Lütfen daha sonra tekrar deneyin." };

  await col.insertOne({ name, email, message, status: "new", createdAt: new Date(), ipHash });
  return { ok: true };
}
