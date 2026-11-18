import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteInteractions from "../components/SiteInteractions";
import styles from "../components/workshop/workshop.module.css";
import { getWorkshopList } from "../../lib/workshops.mjs";

export const metadata = { title: "Atölyeler | IEEE TEDU", description: "IEEE TEDU Computer Society'nin uygulamalı teknik atölyeleri." };

export default function Page() {
  return (
    <>
      <Navbar />
      <main className={styles.hub}>
        <header className={styles.hero}><h1>Atölyeler</h1><p className={styles.lead}>Uygulamalı etkinliklerimiz için kurulum rehberleri ve materyaller.</p></header>
        <div className={styles.grid} style={{ maxWidth: 1100, margin: "0 auto 6rem", padding: "0 var(--page-gutter)" }}>
          {getWorkshopList().map((w) => (
            <a key={w.slug} href={`/workshops/${w.slug}`} className={`${styles.card} ${styles.res}`} style={{ textDecoration: "none", color: "inherit" }}>
              <h4>{w.title}</h4><p className={styles.muted}>{w.summary}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
      <SiteInteractions />
    </>
  );
}
