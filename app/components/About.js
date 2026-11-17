import styles from "./About.module.css";

export default function About() {
  return (
    <section id="about" className={styles.about} data-dark-bg>
      <div className="container reveal">
        <h2 className="section-title">Biz Kimiz?</h2>
        <h3 className={styles.highlight}>
          IEEE TEDU, teknolojiyi insanlık yararına ilerletmeye odaklanmış kolektif bir merkezdir. İnovasyon, liderlik ve dinamik bir öğrenci topluluğuyla akademik teoriyi gerçek dünyanın etkisiyle buluşturuyoruz.
        </h3>
        <div className={styles.textGrid}>
          <p>
            IEEE(Institute of Electrical and Electronics Engineers), 160 ülkede, 400,000’den fazla üyesi ile dünyanın en büyük kar amacı gütmeyen profesyonel teknik organizasyonlarından biridir. IEEE sadece elektrik, elektronik mühendislerine yönelik olmaktan çıkarak bilişim, otomasyon, robotik gibi pek çok mühendislik ve bilim alanında teori ve uygulamalarının gelişimi için çalışmalar yapmanın yanı sıra, bu amaca hizmet etmek isteyen herkes için dünya çapında çeşitli eğitimler ve etkinlikler organize etmektedir.
          </p>
          <p>
            Bu büyük organizasyonun bir parçası olan IEEE TEDU olarak bizler, Computer Society, Robotics and Automation Society ve Women in Engineering gibi alt birimlerimiz ile beraber çalışarak mühendislik ve pozitif bilim alanlarına ilgi duyan herkese birlikte öğrenme ve çalışmalar yapma fırsatı sunmayı hedefliyoruz. Bu süreçte yapacağımız eğitimler ve teknik gezilerle beraber öğrenirken, atölyeler, projeler ve yarışmalarla hem tecrübe kazanmayı hem de bilimin ve teknolojinin gelişmesine katkıda bulunmayı amaçlıyoruz.
          </p>
        </div>
      </div>
    </section>
  );
}
