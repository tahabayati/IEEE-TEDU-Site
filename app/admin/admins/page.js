import { redirect } from "next/navigation";
import styles from "../admin.module.css";
import { getCurrentAdmin, listAdmins } from "../../../lib/admin-auth.mjs";
import { createAdminAction, updateAdminAction, deleteAdminAction } from "../actions";

export const metadata = { title: "Yöneticiler | Yönetim | IEEE TEDU" };

export default async function AdminsPage({ searchParams }) {
  const me = await getCurrentAdmin();
  if (me?.role !== "chief") redirect(me ? "/admin" : "/admin/login");
  const { msg } = await searchParams;
  const admins = await listAdmins();

  return (
    <>
      <h1>Yöneticiler</h1>
      {msg && <p className={styles.msg} role="status">{msg}</p>}

      <h2>Yönetici ekle</h2>
      <form action={createAdminAction} className={styles.card}>
        <AdminFields />
        <button>Yönetici ekle</button>
      </form>

      <h2>Tüm yöneticiler ({admins.length})</h2>
      {admins.length === 0 && <p className={styles.muted}>Henüz yönetici yok.</p>}
      {admins.map((a) => (
        <details key={String(a._id)} className={styles.card}>
          <summary><b>{a.username}</b> <span className={styles.muted}>{a.description}</span></summary>
          <form action={updateAdminAction}>
            <input type="hidden" name="id" value={String(a._id)} />
            <AdminFields admin={a} />
            <button>Kaydet</button>
          </form>
          <form action={deleteAdminAction} className={styles.deleteForm}>
            <input type="hidden" name="id" value={String(a._id)} />
            <button className={styles.danger}>{a.username} kullanıcısını kaldır</button>
          </form>
        </details>
      ))}
    </>
  );
}

function AdminFields({ admin }) {
  return (
    <>
      <label>Kullanıcı adı
        <input name="username" defaultValue={admin?.username} required minLength={3} maxLength={32}
          pattern="[a-zA-Z0-9._\-]+" autoComplete="off" />
      </label>
      <label>Açıklama (isteğe bağlı)
        <textarea name="description" defaultValue={admin?.description} maxLength={500} rows={2} />
      </label>
      <label>{admin ? "Yeni şifre (değiştirmemek için boş bırakın)" : "Şifre"}
        <input name="password" type="password" required={!admin} minLength={8} maxLength={200}
          autoComplete="new-password" />
      </label>
    </>
  );
}
