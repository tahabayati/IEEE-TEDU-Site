import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "../admin.module.css";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { getAllPosts, formatDate } from "../../../lib/blog.mjs";
import { setPostPublishedAction } from "./actions";

export const metadata = { title: "Blog | Yönetim | IEEE TEDU" };

export default async function BlogAdminPage({ searchParams }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const { msg } = await searchParams;
  const posts = await getAllPosts();
  return (
    <>
      <div className={styles.titleRow}>
        <h1>Blog</h1>
        <Link href="/admin/blog/new" className={styles.primaryBtn}>+ Yeni yazı</Link>
      </div>
      {msg && <p className={styles.msg} role="status">{msg}</p>}
      {posts.length === 0 && <p className={styles.empty}>Henüz yazı yok.</p>}
      <ul className={styles.rows}>
        {posts.map((p) => (
          <li key={String(p._id)}>
            <span className={styles.grow}>
              <Link href={`/admin/blog/${p._id}`} className={styles.rowLink}>{p.title}</Link>
              <small>{formatDate(p.date)} · {p.category}</small>
            </span>
            <span className={`${styles.pill} ${p.published ? styles.live : ""}`}>{p.published ? "Yayında" : "Taslak"}</span>
            <form action={setPostPublishedAction}>
              <input type="hidden" name="id" value={String(p._id)} />
              <input type="hidden" name="published" value={p.published ? "0" : "1"} />
              <button className={styles.linkBtn}>{p.published ? "Yayından kaldır" : "Yayınla"}</button>
            </form>
            <Link href={`/admin/blog/${p._id}`} className={styles.linkBtn}>Düzenle</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
