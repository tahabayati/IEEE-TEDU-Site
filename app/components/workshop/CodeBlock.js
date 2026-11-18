"use client";
import { useState } from "react";
import styles from "./workshop.module.css";

const LABEL = { bash: "Terminal", powershell: "Komut İstemi", python: "Python" };

export default function CodeBlock({ code, lang }) {
  const [label, setLabel] = useState("Kopyala");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setLabel("Kopyalandı!");
    } catch {
      setLabel("Kopyalanamadı");
    }
    setTimeout(() => setLabel("Kopyala"), 2000);
  }
  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span>{LABEL[lang] ?? lang ?? "Kod"}</span>
        <button type="button" onClick={copy} className={styles.copy}>
          <span aria-live="polite">{label}</span>
        </button>
      </div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}
