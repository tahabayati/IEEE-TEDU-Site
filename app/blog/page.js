import SiteInteractions from "../components/SiteInteractions";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import styles from "./page.module.css";
import { getPublishedPosts } from "../../lib/blog.mjs";
import { photoUrl } from "../../lib/team.mjs";

export const metadata = { title: "Blog & Etkinlikler | IEEE TEDU" };

// Posts come from MongoDB; the admin panel revalidates this page on every change.
export const revalidate = 3600;

export default async function Page() {
  const posts = await getPublishedPosts();
  return (
    <>
      <Navbar active="/blog" />

      <div className={styles.header}>
        <h1 className={styles.title}>Fikirler &amp; Projeler</h1>
        <p className={styles.subtitle}>Gerçekleştirdiğimiz tüm etkinlikler, projeler ve düşüncelerimiz.</p>
        <a href="/#activities" className={styles.backLink}>← Ana Sayfaya Dön</a>
      </div>

      <div className={styles.list}>
        {posts.length === 0 && <p className={styles.subtitle}>Henüz yazı yok.</p>}
        {posts.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
            <div className={`${styles.image} ${styles[p.color]}`}
              style={p.coverKey ? { backgroundImage: `url('${photoUrl(p.coverKey)}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
            <div className={styles.content}>
              <div className={styles.category}>{p.category}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <div className={styles.excerpt}>{p.excerpt}</div>
            </div>
          </a>
        ))}
      </div>

      <Footer />
      <FloatingContact reveal />
      <SiteInteractions />
    </>
  );
}
