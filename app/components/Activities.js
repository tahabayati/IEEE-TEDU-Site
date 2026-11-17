import styles from "./Activities.module.css";
import { getPublishedPosts } from "../../lib/blog.mjs";

const chevron = (points) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={points} />
  </svg>
);

export default async function Activities() {
  const posts = await getPublishedPosts(8);
  if (posts.length === 0) return null;
  return (
    <section id="activities" className={styles.activities} data-dark-bg>
      <div className="container reveal">
        <h2 className="section-title">Fikirler &amp; Projeler</h2>
      </div>

      <div className={styles.track}>
        <div className={styles.carousel} id="activities-carousel">
          {posts.map((a) => (
            <a key={a.slug} href={`/blog/${a.slug}`} className={`${styles.card} ${styles[a.color]}`}>
              <div className={styles.arrowIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
              <div className={styles.content}>
                <div className={styles.category}>{a.category.toLocaleUpperCase("tr")}</div>
                <h3 className={styles.title}>{a.title}</h3>
              </div>
            </a>
          ))}
        </div>

        <button className={`${styles.navButton} ${styles.prev}`} id="activities-prev-btn" aria-label="Önceki">
          {chevron("15 18 9 12 15 6")}
        </button>
        <button className={`${styles.navButton} ${styles.next}`} id="activities-next-btn" aria-label="Sonraki">
          {chevron("9 18 15 12 9 6")}
        </button>
      </div>
    </section>
  );
}
