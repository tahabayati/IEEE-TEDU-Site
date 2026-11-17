import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "../admin.module.css";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { listMessages, STATUSES } from "../../../lib/messages.mjs";
import { setStatusAction, deleteMessageAction } from "./actions";

export const metadata = { title: "Mesajlar | Yönetim | IEEE TEDU" };

const LABEL = { new: "Yeni", checking: "İnceleniyor", done: "Tamamlandı" };
const when = (d) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(d);

export default async function MessagesPage({ searchParams }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const { status, page } = await searchParams;
  const filter = STATUSES.includes(status) ? status : "";
  const { items, total, pages, page: current } = await listMessages({ status: filter, page });
  const href = (p, s = filter) => `/admin/messages?${[s && `status=${s}`, p > 1 && `page=${p}`].filter(Boolean).join("&")}`;
  const view = [filter && `status=${filter}`, current > 1 && `page=${current}`].filter(Boolean).join("&");

  return (
    <>
      <h1>Mesajlar</h1>
      <div className={styles.toolbar}>
        {["", ...STATUSES].map((s) => (
          <Link key={s || "all"} href={href(1, s)} className={styles.chip} aria-current={s === filter ? "true" : undefined}>
            {s ? LABEL[s] : "Tümü"}
          </Link>
        ))}
      </div>

      {items.length === 0 && <p className={styles.empty}>{filter ? `"${LABEL[filter]}" durumunda mesaj yok.` : "Henüz mesaj yok."}</p>}
      <ul className={styles.rows}>
        {items.map((m) => (
          <li key={String(m._id)} className={styles.message}>
            <div className={styles.messageHead}>
              <span className={styles.grow}>
                <b>{m.name}</b>
                <small><a href={`mailto:${m.email}`}>{m.email}</a> · {when(m.createdAt)}</small>
              </span>
              <span className={`${styles.tag} ${styles[`tag_${m.status}`]}`}>{LABEL[m.status] ?? m.status}</span>
            </div>
            <p className={styles.messageBody}>{m.message}</p>
            <div className={styles.messageActions}>
              {STATUSES.filter((s) => s !== m.status).map((s) => (
                <form key={s} action={setStatusAction}>
                  <input type="hidden" name="id" value={String(m._id)} />
                  <input type="hidden" name="view" value={view} />
                  <input type="hidden" name="status" value={s} />
                  <button className={styles.linkBtn}>{`"${LABEL[s]}" olarak işaretle`}</button>
                </form>
              ))}
              <details className={styles.pop}>
                <summary className={styles.linkBtn}>Sil…</summary>
                <form action={deleteMessageAction} className={styles.popBody}>
                  <input type="hidden" name="id" value={String(m._id)} />
                  <input type="hidden" name="view" value={view} />
                  <span>Bu mesaj kalıcı olarak silinsin mi?</span>
                  <button className={styles.danger}>Evet, sil</button>
                </form>
              </details>
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav className={styles.pager} aria-label="Sayfalar">
          {current > 1 ? <Link href={href(current - 1)}>← Önceki</Link> : <span />}
          <span className={styles.muted}>Sayfa {current} / {pages} · {total} mesaj</span>
          {current < pages ? <Link href={href(current + 1)}>Sonraki →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
