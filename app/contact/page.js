import SiteInteractions from "../components/SiteInteractions";
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

          <form action="#" method="POST" id="contact-form">
            <div className={styles.group}>
              <label className={styles.label} htmlFor="name">Adınız Soyadınız</label>
              <input type="text" id="name" className={styles.input} placeholder="Örn. Ahmet Yılmaz" required />
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="email">E-Posta Adresiniz</label>
              <input type="email" id="email" className={styles.input} placeholder="ornek@sirket.com" required />
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="message">Mesajınız</label>
              <textarea id="message" className={styles.input} placeholder="Detayları buraya yazabilirsiniz..." required></textarea>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submit}`}>MESAJI GÖNDER</button>
          </form>
        </div>
      </div>

      <SiteInteractions />
    </>
  );
}
