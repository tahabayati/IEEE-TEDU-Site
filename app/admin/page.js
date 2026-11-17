import { redirect } from "next/navigation";
import styles from "./admin.module.css";
import { getCurrentAdmin, listAdmins } from "../../lib/admin-auth.mjs";
import {
  logoutAction, createAdminAction, updateAdminAction, deleteAdminAction,
} from "./actions";

export default async function AdminPage({ searchParams }) {
  const me = await getCurrentAdmin();
  if (!me) redirect("/admin/login");
  const { msg } = await searchParams;
  const admins = me.role === "chief" ? await listAdmins() : [];

  return (
    <>
      <div className={styles.row}>
        <h1>Admin panel</h1>
        <form action={logoutAction}><button>Log out</button></form>
      </div>
      <p className={styles.muted}>Logged in as <b>{me.username}</b> ({me.role})</p>
      {msg && <p className={styles.msg} role="status">{msg}</p>}

      {me.role === "chief" && (
        <>
          <h2>Add admin</h2>
          <form action={createAdminAction} className={styles.card}>
            <AdminFields />
            <button>Add admin</button>
          </form>

          <h2>Admins ({admins.length})</h2>
          {admins.length === 0 && <p className={styles.muted}>No admins yet.</p>}
          {admins.map((a) => (
            <div key={String(a._id)} className={styles.card}>
              <form action={updateAdminAction}>
                <input type="hidden" name="id" value={String(a._id)} />
                <AdminFields admin={a} />
                <button>Save</button>
              </form>
              <form action={deleteAdminAction} className={styles.deleteForm}>
                <input type="hidden" name="id" value={String(a._id)} />
                <button className={styles.danger}>Remove {a.username}</button>
              </form>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function AdminFields({ admin }) {
  return (
    <>
      <label>Username
        <input name="username" defaultValue={admin?.username} required minLength={3} maxLength={32}
          pattern="[a-zA-Z0-9._\-]+" autoComplete="off" />
      </label>
      <label>Description (optional)
        <textarea name="description" defaultValue={admin?.description} maxLength={500} rows={2} />
      </label>
      <label>{admin ? "New password (leave blank to keep)" : "Password"}
        <input name="password" type="password" required={!admin} minLength={8} maxLength={200}
          autoComplete="new-password" />
      </label>
    </>
  );
}
