import { redirect } from "next/navigation";
import styles from "../admin.module.css";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { loginAction } from "../actions";

export default async function LoginPage({ searchParams }) {
  if (await getCurrentAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className={styles.card}>
      <h1>Admin login</h1>
      {error && <p className={styles.msg} role="alert">Wrong username or password.</p>}
      <form action={loginAction}>
        <label>Username<input name="username" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button>Log in</button>
      </form>
    </div>
  );
}
