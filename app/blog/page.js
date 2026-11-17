import SiteInteractions from "../components/SiteInteractions";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import styles from "./page.module.css";

export const metadata = { title: "Blog & Etkinlikler | IEEE TEDU" };

const POSTS = [
  {
    href: "/blog-silikon-vadisi",
    color: "peach",
    category: "Kariyer Söyleşileri",
    title: "Silikon Vadisi'nde Bir Türk Mühendis",
    excerpt: "Sektörün önde gelen isimlerinden aldığımız ilhamla teknoloji dünyasının merkezine doğru keyifli bir yolculuk yaptık. Etkinliğimizde hem teknik hem kariyer odaklı tavsiyeler dinledik...",
  },
  {
    href: "/blog-savunma-sanayii",
    color: "blue",
    category: "Teknik Gezi",
    title: "Savunma Sanayii Ziyareti",
    excerpt: "Türkiye'nin savunma sanayindeki öncü kuruluşlarından birini ziyaret ederek, mühendisliğin sahada nasıl hayat bulduğunu yakından deneyimleme şansı elde ettik...",
  },
  {
    href: "/blog-otonom-arac",
    color: "purple",
    category: "Proje Takımları",
    title: "Otonom Araç Projesi Finallerde",
    excerpt: "Yapay zeka ve sensör füzyonu algoritmalarını harmanlayan otonom aracımız, zorlu parkurları tamamlayarak Türkiye genelindeki yarışmada finallere kalmaya hak kazandı...",
  },
  {
    href: "/blog-akademi",
    color: "green",
    category: "Mentörlük",
    title: "Akademi Buluşmaları Devam Ediyor",
    excerpt: "Birinci sınıf öğrencilerini üst dönemler ve mezunlarla buluşturduğumuz akademi toplantılarında tecrübe paylaşımı tüm hızıyla sürüyor...",
  },
  {
    href: "/blog-gomulu-sistemler",
    color: "pink",
    category: "Atölye",
    title: "Gömülü Sistemler ve IoT Temelleri",
    excerpt: "Mikrodenetleyicilerden bulut mimarisine uzanan nesnelerin interneti dünyasına sağlam bir giriş yaptık. Kendi akıllı sensörlerimizi kodladık...",
  },
];

export default function Page() {
  return (
    <>
      <Navbar active="/blog" />

      <div className={styles.header}>
        <h1 className={styles.title}>Fikirler &amp; Projeler</h1>
        <p className={styles.subtitle}>Gerçekleştirdiğimiz tüm etkinlikler, projeler ve düşüncelerimiz.</p>
        <a href="/#activities" className={styles.backLink}>← Ana Sayfaya Dön</a>
      </div>

      <div className={styles.list}>
        {POSTS.map((p) => (
          <a key={p.href} href={p.href} className={styles.card}>
            <div className={`${styles.image} ${styles[p.color]}`}>[Görsel Alanı]</div>
            <div className={styles.content}>
              <div className={styles.category}>{p.category}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <div className={styles.excerpt}>{p.excerpt}</div>
            </div>
          </a>
        ))}
      </div>

      <Footer />
      <FloatingContact reveal />
      <SiteInteractions />
    </>
  );
}
