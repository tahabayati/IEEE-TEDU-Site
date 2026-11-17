import SiteInteractions from "./SiteInteractions";
import FloatingContact from "./FloatingContact";
import styles from "./BlogArticle.module.css";

// Layout shared by every blog post page.
export default function BlogArticle({ date, title, paragraphs }) {
  return (
    <>
      <div className={styles.page}>
        <div className={`${styles.container} reveal`}>
          <a href="/blog" className={styles.backLink}>← Fikirler ve Projelere Dön</a>
          <div className={styles.image}>[ Proje / Etkinlik Görseli ]</div>
          <div className={styles.date}>{date}</div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.content}>
            {paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      </div>
      <FloatingContact />
      <SiteInteractions />
    </>
  );
}
