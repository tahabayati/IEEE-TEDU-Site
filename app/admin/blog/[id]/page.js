import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import styles from "../../admin.module.css";
import { getCurrentAdmin } from "../../../../lib/admin-auth.mjs";
import { postsCollection, getAllPosts, COLORS } from "../../../../lib/blog.mjs";
import { photoUrl } from "../../../../lib/team.mjs";
import { savePostAction, deletePostAction } from "../actions";

export const metadata = { title: "Yazıyı düzenle | Yönetim | IEEE TEDU" };

const COLOR_LABEL = { peach: "Şeftali", blue: "Mavi", purple: "Mor", green: "Yeşil", pink: "Pembe" };

export default async function PostEditorPage({ params, searchParams }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const { id } = await params;
  const { msg, err } = await searchParams;
  const isNew = id === "new";
  let post = null;
  if (!isNew) {
    if (!ObjectId.isValid(id)) notFound();
    post = await (await postsCollection()).findOne({ _id: new ObjectId(id) });
    if (!post) notFound();
  }
  const categories = [...new Set((await getAllPosts()).map((p) => p.category))];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <p className={styles.muted}><Link href="/admin/blog">← Tüm yazılar</Link></p>
      <div className={styles.titleRow}>
        <h1>{isNew ? "Yeni yazı" : "Yazıyı düzenle"}</h1>
        {post?.published && <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>Sitede görüntüle ↗</a>}
      </div>
      {msg && <p className={styles.msg} role="status">{msg}</p>}
      {err && <p className={`${styles.msg} ${styles.error}`} role="alert">{err}</p>}

      <form action={savePostAction} className={styles.editor}>
        {post && <input type="hidden" name="id" value={id} />}
        <label>Başlık
          <input name="title" defaultValue={post?.title} required maxLength={120} />
        </label>
        <div className={styles.fieldRow}>
          <label>Kategori
            <input name="category" list="categories" defaultValue={post?.category} required maxLength={40} placeholder="örn. Atölye" />
            <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>Yazıda görünen tarih
            <input name="date" type="date" required defaultValue={(post?.date ?? new Date(today)).toISOString().slice(0, 10)} />
          </label>
          <label>Kart rengi
            <select name="color" defaultValue={post?.color ?? COLORS[0]}>
              {COLORS.map((c) => <option key={c} value={c}>{COLOR_LABEL[c]}</option>)}
            </select>
          </label>
        </div>
        <label>Özet (blog listesinde görünür)
          <textarea name="excerpt" rows={3} maxLength={400} defaultValue={post?.excerpt} />
        </label>
        <label>Yazı metni
          <textarea name="body" rows={16} required maxLength={50000} defaultValue={post?.body} />
          <small>Paragraflar arasında boş satır bırakın.</small>
        </label>
        <label>Kapak görseli (isteğe bağlı, en fazla 3,5 MB)
          <input name="cover" type="file" accept="image/*" />
        </label>
        {post?.coverKey && (
          <div className={styles.coverRow}>
            <img src={photoUrl(post.coverKey)} alt="" width="160" height="100" className={styles.cover} />
            <label className={styles.check}><input type="checkbox" name="removeCover" /> Kapak görselini kaldır</label>
          </div>
        )}
        <label>Durum
          <select name="status" defaultValue={post?.published ? "published" : "draft"}>
            <option value="draft">Taslak (sitede görünmez)</option>
            <option value="published">Yayında (sitede görünür)</option>
          </select>
        </label>
        <div className={styles.inline}><button>{isNew ? "Yazıyı oluştur" : "Değişiklikleri kaydet"}</button></div>
      </form>

      {post && (
        <details className={`${styles.pop} ${styles.dangerZone}`}>
          <summary className={styles.linkBtn}>Yazıyı sil…</summary>
          <form action={deletePostAction} className={styles.popBody}>
            <input type="hidden" name="id" value={id} />
            <span>&ldquo;{post.title}&rdquo; kalıcı olarak silinsin mi?</span>
            <button className={styles.danger}>Evet, sil</button>
          </form>
        </details>
      )}
    </>
  );
}
