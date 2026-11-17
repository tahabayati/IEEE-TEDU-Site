"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import {
  login, logout, isLockedOut, recordFailure, getCurrentAdmin, createAdmin, updateAdmin, deleteAdmin,
} from "../../lib/admin-auth.mjs";

const USERNAME = /^[a-zA-Z0-9._-]{3,32}$/;
const back = (msg) => redirect(`/admin/admins?msg=${encodeURIComponent(msg)}`);
const text = (form, name) => String(form.get(name) ?? "");

export async function loginAction(form) {
  const username = text(form, "username").trim();
  const password = text(form, "password");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (await isLockedOut(ip)) redirect("/admin/login?error=locked");
  // Length cap keeps scrypt from hashing huge inputs.
  const ok = USERNAME.test(username) && password.length > 0 && password.length <= 200
    && await login(username, password);
  if (!ok) await recordFailure(ip);
  redirect(ok ? "/admin" : "/admin/login?error=1");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

async function requireChief() {
  const me = await getCurrentAdmin();
  if (me?.role !== "chief") redirect("/admin/login");
}

// Returns { fields } or { error }. Password is required on create, optional (blank = keep) on update.
function readAdminForm(form, { passwordRequired }) {
  const username = text(form, "username").trim();
  const description = text(form, "description").trim();
  const password = text(form, "password");
  if (!USERNAME.test(username)) return { error: "Kullanıcı adı: 3-32 karakter; yalnızca harf, rakam, . _ -" };
  if (description.length > 500) return { error: "Açıklama çok uzun (en fazla 500)." };
  if ((passwordRequired || password) && (password.length < 8 || password.length > 200)) {
    return { error: "Şifre 8-200 karakter olmalı." };
  }
  return { fields: { username, description, password } };
}

function adminId(form) {
  const id = text(form, "id");
  if (!ObjectId.isValid(id)) back("Geçersiz yönetici.");
  return id;
}

const isDuplicate = (error) => error?.code === 11000;

export async function createAdminAction(form) {
  await requireChief();
  const { fields, error } = readAdminForm(form, { passwordRequired: true });
  if (error) back(error);
  try {
    await createAdmin(fields);
  } catch (e) {
    if (isDuplicate(e)) back("Bu kullanıcı adı zaten kullanılıyor.");
    throw e;
  }
  back(`"${fields.username}" yöneticisi oluşturuldu.`);
}

export async function updateAdminAction(form) {
  await requireChief();
  const id = adminId(form);
  const { fields, error } = readAdminForm(form, { passwordRequired: false });
  if (error) back(error);
  let found;
  try {
    found = await updateAdmin(id, fields);
  } catch (e) {
    if (isDuplicate(e)) back("Bu kullanıcı adı zaten kullanılıyor.");
    throw e;
  }
  back(found ? `"${fields.username}" yöneticisi güncellendi.` : "Yönetici bulunamadı.");
}

export async function deleteAdminAction(form) {
  await requireChief();
  await deleteAdmin(adminId(form));
  back("Yönetici kaldırıldı.");
}
