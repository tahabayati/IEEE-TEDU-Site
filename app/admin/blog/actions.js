"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { postsCollection, COLORS } from "../../../lib/blog.mjs";
import { uploadImage, MAX_IMAGE_BYTES } from "../../../lib/upload-image.mjs";

const text = (form, name) => String(form.get(name) ?? "").trim();
// Revalidate the home page (latest posts) and every /blog page.
const publish = () => { revalidatePath("/"); revalidatePath("/blog", "layout"); };
const to = (path, msg, key = "msg") => redirect(`${path}?${key}=${encodeURIComponent(msg)}`);

// Server actions are public POST endpoints, so every one re-checks the session.
async function guard() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  return postsCollection();
}

const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
const slugify = (t) => t.toLocaleLowerCase("tr").replace(/[çğıöşü]/g, (c) => TR[c])
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "yazi";

async function freeSlug(posts, title) {
  const base = slugify(title);
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await posts.findOne({ slug }, { projection: { _id: 1 } }))) return slug;
  }
}

export async function savePostAction(form) {
  const posts = await guard();
  const id = text(form, "id");
  const here = id ? `/admin/blog/${id}` : "/admin/blog/new";
  const fail = (m) => to(here, m, "err");
  if (id && !ObjectId.isValid(id)) fail("Geçersiz yazı.");

  const title = text(form, "title");
  const category = text(form, "category");
  const excerpt = text(form, "excerpt");
  const body = text(form, "body");
  const color = text(form, "color");
  const date = new Date(`${text(form, "date")}T00:00:00Z`);
  if (!title || title.length > 120) fail("Başlık gerekli (en fazla 120).");
  if (!category || category.length > 40) fail("Kategori gerekli (en fazla 40).");
  if (excerpt.length > 400) fail("Özet çok uzun (en fazla 400).");
  if (!body || body.length > 50000) fail("Yazı metnini girin (en fazla 50.000 karakter).");
  if (!COLORS.includes(color)) fail("Bir kart rengi seçin.");
  if (Number.isNaN(+date)) fail("Geçerli bir tarih seçin.");

  const fields = { title, category, excerpt, body, color, date, published: text(form, "status") === "published" };
  const cover = form.get("cover");
  if (cover instanceof File && cover.size > 0) {
    if (cover.size > MAX_IMAGE_BYTES) fail("Kapak görseli çok büyük (en fazla 3,5 MB).");
    try {
      fields.coverKey = await uploadImage(cover, { prefix: "blog", width: 1600, height: 1000 });
    } catch {
      fail("Bu dosya okunabilir bir görsel değil.");
    }
  } else if (form.get("removeCover")) {
    fields.coverKey = null;
  }

  if (id) {
    const { matchedCount } = await posts.updateOne({ _id: new ObjectId(id) }, { $set: fields });
    if (!matchedCount) fail("Yazı bulunamadı.");
    publish();
    to(here, fields.published ? "Kaydedildi ve sitede yayında." : "Taslak olarak kaydedildi.");
  }
  // shortcut: slug check then insert can race; the unique index makes the loser fail loudly. Fine for a few admins.
  const { insertedId } = await posts.insertOne({
    coverKey: null, ...fields, slug: await freeSlug(posts, title), createdAt: new Date(),
  });
  publish();
  to(`/admin/blog/${insertedId}`, fields.published ? "Yayınlandı." : "Taslak oluşturuldu.");
}

export async function setPostPublishedAction(form) {
  const posts = await guard();
  const id = text(form, "id");
  if (ObjectId.isValid(id)) await posts.updateOne({ _id: new ObjectId(id) }, { $set: { published: form.get("published") === "1" } });
  publish();
  to("/admin/blog", "Durum güncellendi.");
}

export async function deletePostAction(form) {
  const posts = await guard();
  const id = text(form, "id");
  if (ObjectId.isValid(id)) await posts.deleteOne({ _id: new ObjectId(id) });
  publish();
  to("/admin/blog", "Yazı silindi.");
}
