import styles from "./Activities.module.css";

const ACTIVITIES = [
  { href: "/blog-silikon-vadisi", color: "peach", category: "KARİYER SÖYLEŞİLERİ", title: "Silikon Vadisi'nde Bir Türk Mühendis" },
  { href: "/blog-savunma-sanayii", color: "blue", category: "TEKNİK GEZİ", title: "Savunma Sanayii Ziyareti" },
  { href: "/blog-otonom-arac", color: "purple", category: "PROJE TAKIMLARI", title: "Otonom Araç Projesi Finallerde Derece Yaptı" },
  { href: "/blog-akademi", color: "green", category: "MENTÖRLÜK", title: "Akademi Buluşmaları Devam Ediyor" },
  { href: "/blog-gomulu-sistemler", color: "pink", category: "ATÖLYE", title: "Gömülü Sistemler ve IoT Temelleri" },
];

const chevron = (points) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={points} />
  </svg>
);

export default function Activities() {
  return (
    <section id="activities" className={styles.activities} data-dark-bg>
      <div className="container reveal">
        <h2 className="section-title">Fikirler &amp; Projeler</h2>
      </div>

      <div className={styles.track}>
        <div className={styles.carousel} id="activities-carousel">
          {ACTIVITIES.map((a) => (
            <a key={a.href} href={a.href} className={`${styles.card} ${styles[a.color]}`}>
              <div className={styles.arrowIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
              <div className={styles.content}>
                <div className={styles.category}>{a.category}</div>
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
