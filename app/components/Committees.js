import styles from "./Committees.module.css";

const COMMITTEES = [
  {
    id: "cs-mobile",
    tab: "CS",
    title: "Computer Society",
    logo: "/assets/images/Initial-elements/IEEE_TEDU_CS-Symbol.jpg",
    alt: "Computer Society Logo",
    text: [
      "Yazılım dünyasının dinamizmini, algoritmaların mantığıyla birleştiriyoruz. Computer Society olarak sadece kod yazmıyor; dijital evrenin her katmanını keşfediyoruz.",
      "Geliştirdiğimiz projeler ve düzenlediğimiz teknik eğitimlerle teorik bilgiyi pratiğe dökerek yarının teknoloji liderlerini hazırlıyoruz.",
    ],
  },
  {
    id: "ras-mobile",
    tab: "RAS",
    title: "RAS",
    logo: "/assets/images/Initial-elements/IEEE_TEDU_RAS-Symbol.jpg",
    alt: "Robotics Society Logo",
    text: [
      "Mekanik estetiği, kontrol sistemlerinin zekasıyla bir araya getiriyoruz. RAS bünyesinde, hayal edilen projeleri somut robotik sistemlere dönüştürmek için çalışıyoruz.",
      "Sensörlerden gömülü sistemlere kadar otomasyonun her adımında elini taşın altına koyan bir ekibiz.",
    ],
  },
  {
    id: "wie-mobile",
    tab: "WIE",
    title: "WIE",
    logo: "/assets/images/Initial-elements/IEEE_TEDU_WIE-Symbol.jpg",
    alt: "WIE Logo",
    text: [
      "Teknoloji ve bilimde cinsiyet bariyerlerini yıkarak, herkes için kapsayıcı bir mühendislik kültürü inşa ediyoruz. WIE olarak, STEM alanındaki varlığı güçlendiriyoruz.",
      "Çeşitliliğin getirdiği zenginlikle, daha adil ve yenilikçi bir gelecek için birlikte ilerliyoruz.",
    ],
  },
];

// The mobile switcher is wired up in site-interactions.js via data-com-tab / data-active.
export default function Committees() {
  return (
    <section id="committees" className={styles.committees}>
      <div className={styles.container}>
        <h2 className="section-title reveal">Komiteler</h2>
        <div className={`${styles.switcher} reveal`}>
          {COMMITTEES.map((c, i) => (
            <button key={c.id} className={styles.tab} data-com-tab={c.id} aria-controls={c.id} aria-pressed={i === 0} data-active={i === 0 || undefined}>
              {c.tab}
            </button>
          ))}
        </div>

        <div className={`${styles.grid} reveal`}>
          {COMMITTEES.map((c, i) => (
            <div key={c.id} id={c.id} className={styles.wrapper} data-active={i === 0 || undefined}>
              <details className={styles.card}>
                <summary className={styles.summary}>
                  <div className={styles.logo}>
                    <img src={c.logo} alt={c.alt} />
                  </div>
                  <div className={styles.header}>
                    <h3 className={styles.title}>{c.title}</h3>
                    <div className={styles.iconWrap}>
                      <span className={styles.plus}></span>
                    </div>
                  </div>
                </summary>
                <div className={styles.description}>
                  {c.text.map((t) => <p key={t}>{t}</p>)}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
