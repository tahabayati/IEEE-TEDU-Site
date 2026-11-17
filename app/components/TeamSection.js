import styles from "./TeamSection.module.css";

// Server-rendered team section. Year switching, tabs and arrows are wired up in site-interactions.js
// through the data-* attributes below (CSS-module class names are renamed at build time).
const TBA = "Açıklanacak";

function LinkedIn({ href }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.linkedin} title="LinkedIn Profile">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    </a>
  );
}

// Photo URLs come from the database, so they are set inline instead of in CSS.
const photo = (url) => (url ? { backgroundImage: `url('${url}')` } : undefined);

function Card({ person }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardPhoto} style={photo(person?.photo)}>
        <LinkedIn href={person?.linkedin} />
      </div>
      <div className={styles.cardContent}>
        <h4 className={styles.cardName}>{person?.name ?? TBA}</h4>
      </div>
    </div>
  );
}

const chevron = (points) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={points} />
  </svg>
);

export default function TeamSection({ years }) {
  if (years.length === 0) return null;
  const current = years.at(-1).id; // newest published year opens first

  return (
    <section id="team" className={styles.team}>
      <div className="container">
        <h2 className={`section-title reveal ${styles.title}`}>Yönetim Kurulu</h2>

        {years.length > 1 && (
          <div className={`${styles.yearSwitcher} reveal`}>
            {years.map((y) => (
              <button key={y.id} className={styles.yearButton} data-year={y.id} aria-pressed={y.id === current} data-active={y.id === current || undefined}>
                {y.id}
              </button>
            ))}
          </div>
        )}

        {years.map((y) => (
          <div key={y.id} className={styles.yearPanel} data-team-year={y.id} hidden={y.id !== current}>
            {y.board.length > 0 && (
              <div className={`${styles.board} reveal`}>
                {y.board.map((p, i) => (
                  <div key={i} className={styles.president}>
                    <div className={`${styles.presidentPhoto} ${p.photo ? "" : styles.noPhoto}`} style={photo(p.photo)}>
                      <LinkedIn href={p.linkedin} />
                    </div>
                    <h3 className={styles.presidentName}>{p.name}</h3>
                    <p className={styles.presidentRole}>{p.title}</p>
                  </div>
                ))}
              </div>
            )}

            <div className={`${styles.tabsContainer} reveal`}>
              <div className={styles.tabs}>
                {y.groups.map((g, i) => (
                  <div key={i} className={styles.tab} data-tab={i} data-active={i === 0 || undefined}>
                    <div className={styles.leader}>
                      <div className={styles.leaderPhoto} style={photo(g.leader?.photo)}>
                        <LinkedIn href={g.leader?.linkedin} />
                      </div>
                      <p className={styles.leaderName}>{g.leader?.name ?? TBA}</p>
                    </div>
                    <div className={styles.tabBox}>
                      <button className={styles.tabName} aria-pressed={i === 0}>{g.name}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.carousels} reveal`}>
        {years.map((y) => (
          <div key={y.id} className={styles.yearPanel} data-team-boards={y.id} hidden={y.id !== current}>
            {y.groups.map((g, i) => (
              <div key={i} className={styles.carousel} data-board={i} data-active={i === 0 || undefined}>
                {g.members.length > 0
                  ? g.members.map((m, j) => <Card key={j} person={m} />)
                  : [0, 1, 2].map((j) => <Card key={j} />)}
              </div>
            ))}
          </div>
        ))}
        <div className={styles.hint} id="team-hint" aria-hidden="true">
          <span className={styles.hintText}>Kaydır {chevron("9 18 15 12 9 6")}</span>
          <div className={styles.track}><i id="team-progress" /></div>
        </div>
        <button className={`${styles.navButton} ${styles.prev}`} id="team-prev-btn" aria-label="Önceki">{chevron("15 18 9 12 15 6")}</button>
        <button className={`${styles.navButton} ${styles.next}`} id="team-next-btn" aria-label="Sonraki">{chevron("9 18 15 12 9 6")}</button>
      </div>
    </section>
  );
}
