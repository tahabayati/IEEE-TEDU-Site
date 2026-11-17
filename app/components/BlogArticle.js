import SiteInteractions from "./SiteInteractions";
import FloatingContact from "./FloatingContact";
import styles from "./BlogArticle.module.css";
import { formatDate, paragraphs } from "../../lib/blog.mjs";
import { photoUrl } from "../../lib/team.mjs";

// Layout shared by every blog post page.
export default function BlogArticle({ post }) {
  return (
    <>
      <div className={styles.page}>
        <div className={`${styles.container} reveal`}>
          <a href="/blog" className={styles.backLink}>← Fikirler ve Projelere Dön</a>
          {post.coverKey && (
            <div className={styles.image} role="img" aria-label={post.title}
              style={{ backgroundImage: `url('${photoUrl(post.coverKey)}')` }} />
          )}
          <div className={styles.date}>{formatDate(post.date)}</div>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.content}>
            {paragraphs(post.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
      <FloatingContact />
      <SiteInteractions />
    </>
  );
}
