"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import CodeBlock from "./CodeBlock";
import styles from "./workshop.module.css";

const ICONS = "/assets/web101-scraping/Icons";
const OS = [
  { id: "windows", label: "Windows", icon: `${ICONS}/Windows_logo_2012-Black.svg` },
  { id: "macos", label: "macOS", icon: `${ICONS}/Apple_logo_black.svg` },
  { id: "linux", label: "Linux", icon: `${ICONS}/Tux.svg` },
];

// Preselect the visitor's system; the server render (and first paint) uses Windows.
const detectOs = () => {
  const ua = navigator.userAgent;
  return /Mac/i.test(ua) && !/iPhone|iPad/i.test(ua) ? "macos" : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? "linux" : "windows";
};
const noSubscribe = () => () => {};

// Click-to-load: nothing is requested from YouTube until the viewer presses play.
function Video({ id, title, watchUrl, thumbnail }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className={styles.videoWrap}>
      <div className={styles.video}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Videoyu oynat: ${title}`}>
            {thumbnail && <img src={thumbnail} alt="" loading="lazy" />}
            <span className={styles.play} aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
          </button>
        )}
      </div>
      <figcaption><a href={watchUrl} target="_blank" rel="noopener noreferrer">YouTube’da izle ↗</a></figcaption>
    </figure>
  );
}

// A string starts a new numbered step; { code } blocks attach to the step before them.
function groupSteps(items) {
  const out = [];
  for (const it of items) {
    if (typeof it === "string" || !out.length) out.push({ text: typeof it === "string" ? it : null, code: typeof it === "string" ? [] : [it] });
    else out[out.length - 1].code.push(it);
  }
  return out;
}

// Tip / Check box. Items: strings, { code, lang } blocks, or { href, label } links.
function Callout({ label, className, items }) {
  if (!items?.length) return null;
  items = [].concat(items); // a single string is allowed too
  return (
    <div className={className}>
      <strong>{label}</strong>
      {items.map((b, j) =>
        typeof b === "string" ? <p key={j}>{b}</p>
          : b.href ? <p key={j}><a href={b.href} target="_blank" rel="noopener noreferrer">{b.label} ↗</a></p>
          : <CodeBlock key={j} code={b.code} lang={b.lang} />,
      )}
    </div>
  );
}

export default function Guides({ tools }) {
  const detected = useSyncExternalStore(noSubscribe, detectOs, () => "windows");
  const [picked, setPicked] = useState(null);
  const os = picked ?? detected;
  const [active, setActive] = useState(tools[0]?.id);

  // Highlight the step currently on screen in the step list.
  useEffect(() => {
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = tools.find((t) => seen.get(`step-${t.id}`));
        if (first) setActive(first.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    tools.forEach((t) => { const el = document.getElementById(`step-${t.id}`); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [tools]);

  return (
    <>
      <div className={styles.osPicker} role="radiogroup" aria-label="İşletim sistemin">
        <span>Sistemin</span>
        {OS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={os === o.id} onClick={() => setPicked(o.id)} className={styles.osBtn}>
            <img src={o.icon} alt="" width="18" height="18" />{o.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <nav className={styles.steps} aria-label="Kurulum adımları">
          <ol>
            {tools.map((t, i) => (
              <li key={t.id}>
                <a href={`#step-${t.id}`} aria-current={active === t.id ? "step" : undefined}>
                  <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.railIcons}>{[].concat(t.icon).map((src) => <img key={src} src={src} alt="" />)}</span>
                  <span className={styles.stepName}>{t.name}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          {tools.map((t, i) => (
            <section key={t.id} id={`step-${t.id}`} className={styles.step} aria-labelledby={`h-${t.id}`}>
              <div className={styles.stepHead}>
                <span className={styles.logos}>{[].concat(t.icon).map((src) => <img key={src} src={src} alt="" />)}</span>
                <div>
                  <p className={styles.eyebrow}>Adım {i + 1}</p>
                  <h2 id={`h-${t.id}`}>{t.name}</h2>
                </div>
              </div>
              <p className={styles.lead}>{t.description}</p>
              <a className={styles.download} href={t.url} target="_blank" rel="noopener noreferrer">{t.urlLabel ?? "İndir"} ↗</a>
              {t.extraLinks?.map((l) => <a key={l.url} className={styles.extra} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}

              <h3>{OS.find((o) => o.id === os).label} için kurulum</h3>
              <ol className={styles.list}>
                {groupSteps(t.install[os] ?? []).map((g, j) => (
                  <li key={j}>{g.text}{g.code.map((c, k) => <CodeBlock key={k} code={c.code} lang={c.lang} />)}</li>
                ))}
              </ol>
              {t.videos[os] && <Video key={`${t.id}-${os}`} id={t.videos[os].id} title={t.videos[os].title ?? `${t.name} kurulum videosu`} watchUrl={t.videos[os].url} thumbnail={t.videos[os].thumbnail} />}
              <Callout label="İpucu" className={styles.tip} items={t.tips?.[os]} />
              <Callout label="Kontrol" className={styles.check} items={typeof t.verify === "string" ? t.verify : t.verify?.[os]} />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
