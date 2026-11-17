import styles from "./Navbar.module.css";

const LINKS = [
  ["/#home", "Ana Sayfa"],
  ["/#about", "Hakkımızda"],
  ["/#committees", "Komiteler"],
  ["/#team", "Ekibimiz"],
  ["/blog", "Blog"],
  ["/contact", "İletişim"],
];

// `active` is the href of the current page's link, e.g. "/blog".
export default function Navbar({ active }) {
  return (
    <nav className={styles.navbar} id="navbar" aria-label="Ana menü">
      <div className={styles.container}>
        <a href="/#home" className={styles.brandLink}>
          <img src="/assets/images/Initial-elements/IEEE_LOGOwTEDU_MAVI.png" alt="IEEE TEDU Logo" className={styles.logo} />
        </a>
        <details className={styles.mobileMenu} id="mobile-menu">
          <summary className={styles.menuToggle}>Menü <span aria-hidden="true" className={styles.menuIcon} /></summary>
          <ul className={styles.mobileLinks}>
            {LINKS.map(([href, label]) => (
              <li key={href}><a href={href} aria-current={href === active ? "page" : undefined}>{label}</a></li>
            ))}
          </ul>
        </details>
        <ul className={styles.links}>
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href} className={href === active ? styles.active : undefined}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
