import { redirect } from "next/navigation";
import styles from "../admin.module.css";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { loginAction } from "../actions";

export default async function LoginPage({ searchParams }) {
  if (await getCurrentAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className={styles.card}>
      <h1>Yönetici girişi</h1>
      {error && <p className={styles.msg} role="alert">{error === "locked" ? "Çok fazla deneme. 10 dakika sonra tekrar deneyin." : "Kullanıcı adı veya şifre hatalı."}</p>}
      <form action={loginAction}>
        <label>Kullanıcı adı<input name="username" autoComplete="username" required /></label>
        <label>Şifre<input name="password" type="password" autoComplete="current-password" required /></label>
        <button>Giriş yap</button>
      </form>
    </div>
  );
}
