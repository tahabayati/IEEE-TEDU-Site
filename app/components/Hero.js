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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
