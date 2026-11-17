"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { getDatabase } from "../../../lib/mongodb.mjs";
import { uploadImage, MAX_IMAGE_BYTES } from "../../../lib/upload-image.mjs";

const text = (form, name) => String(form.get(name) ?? "").trim();
// Stay on the same year after an action (people actions send no year).
const back = (form, msg) => {
  const year = text(form, "year");
  redirect(`/admin/team?${year ? `year=${encodeURIComponent(year)}&` : ""}msg=${encodeURIComponent(msg)}`);
};
const done = (form, msg) => { revalidatePath("/"); back(form, msg); };
const fail = back;

// Every action re-checks the session: server actions are public POST endpoints.
async function guard() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  return getDatabase();
}

function oid(form, name) {
  const v = text(form, name);
  if (!ObjectId.isValid(v)) fail(form, "Geçersiz istek.");
  return new ObjectId(v);
}

function linkedinOf(form) {
  const v = text(form, "linkedin");
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" && /(^|\.)linkedin\.com$/.test(u.hostname)) return u.href;
  } catch {}
  return fail(form, "LinkedIn, https://…linkedin.com bağlantısı olmalı.");
}

async function photoOf(form) {
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (file.size > MAX_IMAGE_BYTES) fail(form, "Fotoğraf çok büyük (en fazla 3,5 MB).");
  try {
    return await uploadImage(file, { prefix: "team", width: 600, height: 600 });
  } catch {
    return fail(form, "Bu dosya okunabilir bir görsel değil.");
  }
}

export async function savePersonAction(form) {
  const db = await guard();
  const name = text(form, "name");
  if (name.length < 2 || name.length > 80) fail(form, "İsim 2-80 karakter olmalı.");
  const fields = { name, linkedin: linkedinOf(form) };
  const photoKey = await photoOf(form);
  if (photoKey) fields.photoKey = photoKey;
  else if (form.get("removePhoto")) fields.photoKey = null;

  if (form.get("id")) {
    const { matchedCount } = await db.collection("people").updateOne({ _id: oid(form, "id") }, { $set: fields });
    done(form, matchedCount ? `${name} güncellendi.` : "Kişi bulunamadı.");
  }
  await db.collection("people").insertOne({ photoKey: null, ...fields, createdAt: new Date() });
  done(form, `${name} eklendi. Yıllar sekmesinden bir yıla atayın.`);
}

export async function deletePersonAction(form) {
  const db = await guard();
  const id = oid(form, "id");
  await db.collection("people").deleteOne({ _id: id });
  // Remove their slots too, so no year keeps a dangling reference.
  const years = db.collection("team_years");
  await years.updateMany({}, { $pull: { board: { personId: id }, "groups.$[].members": { personId: id } } });
  await years.updateMany({}, { $set: { "groups.$[g].leader": null } }, { arrayFilters: [{ "g.leader.personId": id }] });
  done(form, "Kişi silindi.");
}

export async function createYearAction(form) {
  const db = await guard();
  const id = text(form, "year");
  const m = /^(\d{4})-(\d{4})$/.exec(id);
  if (!m || +m[2] !== +m[1] + 1) fail(form, "Yıl 2025-2026 biçiminde olmalı.");
  try {
    await db.collection("team_years").insertOne({ _id: id, order: +m[1], published: false, board: [], groups: [] });
  } catch (e) {
    if (e?.code === 11000) fail(form, "Bu yıl zaten var.");
    throw e;
  }
  done(form, `${id} oluşturuldu (yayınlayana kadar gizli).`);
}

export async function setPublishedAction(form) {
  const db = await guard();
  await db.collection("team_years").updateOne({ _id: text(form, "year") }, { $set: { published: form.get("published") === "1" } });
  done(form, "Görünürlük güncellendi.");
}

export async function deleteYearAction(form) {
  const db = await guard();
  await db.collection("team_years").deleteOne({ _id: text(form, "year") });
  done(form, "Yıl silindi.");
}

// Load a year, let `edit` change it, save board+groups back. `edit` returns an error string or nothing.
// Read, change, write back: if two admins edit the same year at once, the last save wins.
async function editYear(form, edit) {
  const db = await guard();
  const years = db.collection("team_years");
  const year = await years.findOne({ _id: text(form, "year") });
  if (!year) fail(form, "Yıl bulunamadı.");
  const error = edit(year);
  if (error) fail(form, error);
  await years.updateOne({ _id: year._id }, { $set: { board: year.board, groups: year.groups } });
}

export async function addBoardAction(form) {
  const personId = oid(form, "personId");
  const title = text(form, "title");
  if (!title || title.length > 80) fail(form, "Yönetim kurulu üyesine bir unvan verin (en fazla 80).");
  await editYear(form, (y) => {
    if (y.board.some((s) => s.personId.equals(personId))) return "Zaten yönetim kurulunda.";
    y.board.push({ personId, title });
  });
  done(form, "Yönetim kurulu üyesi eklendi.");
}

export async function removeBoardAction(form) {
  const personId = oid(form, "personId");
  await editYear(form, (y) => { y.board = y.board.filter((s) => !s.personId.equals(personId)); });
  done(form, "Yönetim kurulu üyesi kaldırıldı.");
}

// Swap a person with their neighbour in the board list, or in a group's member list when `group` is set.
export async function moveAction(form) {
  const personId = oid(form, "personId");
  const step = text(form, "dir") === "up" ? -1 : 1;
  const group = text(form, "group");
  await editYear(form, (y) => {
    const list = group ? y.groups.find((g) => g.name === group)?.members : y.board;
    if (!list) return "Grup bulunamadı.";
    const i = list.findIndex((s) => s.personId.equals(personId));
    const j = i + step;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
  });
  done(form, "Sıralama güncellendi.");
}

export async function addGroupAction(form) {
  const name = text(form, "name");
  if (!name || name.length > 40) fail(form, "Grup adı gerekli (en fazla 40).");
  await editYear(form, (y) => {
    if (y.groups.some((g) => g.name === name)) return "Bu grup zaten var.";
    y.groups.push({ name, leader: null, members: [] });
  });
  done(form, `${name} grubu eklendi.`);
}

export async function removeGroupAction(form) {
  const name = text(form, "group");
  await editYear(form, (y) => { y.groups = y.groups.filter((g) => g.name !== name); });
  done(form, "Grup kaldırıldı.");
}

// role: "leader" replaces the group's leader; "member" adds to the list.
export async function addGroupPersonAction(form) {
  const personId = oid(form, "personId");
  const role = text(form, "role");
  await editYear(form, (y) => {
    const g = y.groups.find((x) => x.name === text(form, "group"));
    if (!g) return "Grup bulunamadı.";
    if (role === "leader") g.leader = { personId, title: "" };
    else if (g.members.some((s) => s.personId.equals(personId))) return "Zaten bu grupta.";
    else g.members.push({ personId, title: "" });
  });
  done(form, "Grup güncellendi.");
}

export async function removeGroupPersonAction(form) {
  const personId = oid(form, "personId");
  await editYear(form, (y) => {
    const g = y.groups.find((x) => x.name === text(form, "group"));
    if (!g) return "Grup bulunamadı.";
    if (g.leader?.personId.equals(personId) && text(form, "role") === "leader") g.leader = null;
    else g.members = g.members.filter((s) => !s.personId.equals(personId));
  });
  done(form, "Grup güncellendi.");
}
