"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminNav({ items }) {
  const path = usePathname();
  return (
    <nav className={styles.nav} aria-label="Yönetim">
      {items.map(({ href, label }) => (
        <Link key={href} href={href} className={styles.navLink}
          aria-current={(href === "/admin" ? path === href : path.startsWith(href)) ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
