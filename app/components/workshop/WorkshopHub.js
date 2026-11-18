import Navbar from "../Navbar";
import Footer from "../Footer";
import FloatingContact from "../FloatingContact";
import SiteInteractions from "../SiteInteractions";
import Guides from "./Guides";
import PrintButton from "./PrintButton";
import styles from "./workshop.module.css";

export default function WorkshopHub({ w }) {
  return (
    <>
      <Navbar />
      <main className={styles.hub}>
        <header className={styles.hero}>
          <p className={`${styles.eyebrow} ${styles.noCaps}`}>{w.title}</p>
          <div className={styles.titleRow}><h1>Kurulum rehberleri</h1><PrintButton /></div>
        </header>
        {w.tools.length > 0 && <Guides tools={w.tools} />}
      </main>
      <Footer />
      <FloatingContact reveal />
      <SiteInteractions />
    </>
  );
}
