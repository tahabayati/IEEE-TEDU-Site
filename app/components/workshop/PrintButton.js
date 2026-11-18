"use client";
import styles from "./workshop.module.css";

export default function PrintButton() {
  return <button type="button" className={styles.ghostBtn} onClick={() => window.print()}>Rehberi yazdır</button>;
}
