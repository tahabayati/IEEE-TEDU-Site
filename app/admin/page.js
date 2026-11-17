import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./admin.module.css";
import { getCurrentAdmin } from "../../lib/admin-auth.mjs";

export default async function AdminPage() {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  return (
    <>
      <h1>Hızlı işlemler</h1>
      <div className={styles.actions}>
        <Link href="/admin/team?tab=people" className={styles.card}><b>Ekip üyesi ekle</b><span className={styles.muted}>İsim, fotoğraf ve LinkedIn.</span></Link>
        <Link href="/admin/team" className={styles.card}><b>Bir yılın ekibini düzenle</b><span className={styles.muted}>Yönetim kurulu, gruplar, yayınla veya gizle.</span></Link>
        <Link href="/admin/blog/new" className={styles.card}><b>Blog yazısı yaz</b><span className={styles.muted}>Yeni yazı taslağı oluştur veya yayınla.</span></Link>
        <Link href="/admin/blog" className={styles.card}><b>Blog yazılarını yönet</b><span className={styles.muted}>Metin, tarih düzenle; yayınla veya yayından kaldır.</span></Link>
        <Link href="/admin/messages" className={styles.card}><b>Mesajları oku</b><span className={styles.muted}>İletişim formu mesajları ve etiketleri.</span></Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className={styles.card}><b>Siteyi aç</b><span className={styles.muted}>Değişiklikleri canlı gör.</span></a>
      </div>
    </>
  );
}
