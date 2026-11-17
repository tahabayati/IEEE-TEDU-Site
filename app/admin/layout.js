import styles from "./admin.module.css";

export const metadata = {
  title: "Admin | IEEE TEDU",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <main className={styles.admin}>{children}</main>;
}
