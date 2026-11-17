import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className="container">
        <h1 className={`${styles.title} reveal`}>
          <span className={styles.word}>Mühendislikte</span> <br />
          <span className={styles.accent}>her zaman</span> <br />
          <span className={styles.word}>Bir Adım</span> <br />
          <span className={styles.word}>İleriye</span>
        </h1>
        <p className={`${styles.subtitle} reveal`}>
          IEEE TEDU Teknoloji ve Mühendislik topluluğu olarak, evrensel mühendislik standartlarını kampüse taşıyoruz. Geleceği bizimle inşa et.
        </p>
        <div className={`${styles.buttonWrap} reveal`}>
          <a href="#about" className={`btn btn-primary ${styles.button}`}>Keşfet</a>
        </div>
      </div>
      <div className={`${styles.scrollIndicator} reveal`}>
        <svg width="42" height="57" viewBox="36 29 28 38" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path className={styles.arrowA} d="M40 31.83L50 39.33L60 31.83" />
          <path className={styles.arrowB} d="M40 50.67L50 58.17L60 50.67" />
        </svg>
      </div>
    </section>
  );
}
