import styles from "./admin.module.css";
import AdminNav from "./AdminNav";
import { getCurrentAdmin } from "../../lib/admin-auth.mjs";
import { logoutAction } from "./actions";

export const metadata = {
  title: "Yönetim | IEEE TEDU",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const me = await getCurrentAdmin();
  // Login page (no session) gets no sidebar.
  if (!me) return <main className={styles.bare}>{children}</main>;

  const items = [
    { href: "/admin", label: "Genel Bakış" },
    { href: "/admin/team", label: "Ekip" },
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/messages", label: "Mesajlar" },
    ...(me.role === "chief" ? [{ href: "/admin/admins", label: "Yöneticiler" }] : []),
  ];
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>IEEE <span>TEDU</span></div>
        <AdminNav items={items} />
        <div className={styles.sideFoot}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>↗ Siteyi görüntüle</a>
          <form action={logoutAction}><button className={styles.ghost}>Çıkış yap</button></form>
        </div>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
