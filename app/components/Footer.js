import styles from "./Footer.module.css";

const INSTAGRAM = [
  ["https://www.instagram.com/ieee.tedu/", "IEEE TEDU"],
  ["https://www.instagram.com/ieeeteducomputersociety/", "Computer Society"],
  ["https://www.instagram.com/tedu.ras/", "Robotics and Auto"],
  ["https://www.instagram.com/teduwie/", "Women in Engineering"],
];

function Icon({ children }) {
  return (
    <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {children}
    </svg>
  );
}

const instagramIcon = (
  <Icon>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </Icon>
);

export default function Footer() {
  return (
    // data-dark-bg: the floating contact button switches colors over this section
    <footer id="contact" className={styles.footer} data-dark-bg>
      <div className="container">
        <div className={`${styles.top} reveal`}>
          <div>
            <h2 className={styles.joinText}>
              BİZE
              <br />
              <span className={styles.accent}>KATIL.</span>
            </h2>
          </div>
          <div className={styles.links}>
            <div className={`${styles.group} ${styles.instagramGroup}`}>
              <h4>Instagram</h4>
              <ul>
                {INSTAGRAM.map(([href, label]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer">{instagramIcon}{` ${label}`}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.column}>
              <div className={styles.group}>
                <h4>Profesyonel Ağ</h4>
                <ul>
                  <li>
                    <a href="https://www.linkedin.com/company/ieeetedusb/" target="_blank" rel="noopener noreferrer">
                      <Icon>
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </Icon>
                      {" LinkedIn"}
                    </a>
                  </li>
                </ul>
              </div>
              <div className={`${styles.group} ${styles.contactGroup}`}>
                <h4>İletişim</h4>
                <ul>
                  <li>
                    <a href="mailto:ieee@tedu.edu.tr">
                      <Icon>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </Icon>
                      {" ieee@tedu.edu.tr"}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© 2026 IEEE TEDU Student Society. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
