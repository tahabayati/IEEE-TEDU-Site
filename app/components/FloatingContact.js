import styles from "./FloatingContact.module.css";

export default function FloatingContact({ reveal = false }) {
  return (
    <a href="/contact" className={reveal ? `${styles.button} reveal` : styles.button} id="floating-contact">
      <span className={styles.title}>İletişim</span>
    </a>
  );
}
