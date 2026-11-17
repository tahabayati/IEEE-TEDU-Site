import SiteInteractions from "../components/SiteInteractions";
import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export const metadata = { title: "İletişim | IEEE TEDU" };

export default function Page() {
  return (
    <>
      <a href="/" className={styles.backLink}>← Geri Dön</a>

      <div className={styles.page}>
        <div className={`${styles.container} reveal`}>
          <div className={styles.header}>
            <h1 className={styles.title}>İletişime Geçin</h1>
            <p className={styles.subtitle}>İşbirlikleri, projeler ve sorularınız için bize ulaşın.</p>
          </div>

          <ContactForm />
        </div>
      </div>

      <SiteInteractions />
    </>
  );
}
