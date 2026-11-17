import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "../admin.module.css";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { getDatabase } from "../../../lib/mongodb.mjs";
import { photoUrl } from "../../../lib/team.mjs";
import {
  savePersonAction, deletePersonAction, createYearAction, setPublishedAction, deleteYearAction,
  addBoardAction, removeBoardAction, addGroupAction, removeGroupAction,
  addGroupPersonAction, removeGroupPersonAction, moveAction,
} from "./actions";

export const metadata = { title: "Ekip | Yönetim | IEEE TEDU" };

export default async function TeamAdminPage({ searchParams }) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const { msg, err, tab, year: yearParam, q = "" } = await searchParams;
  const db = await getDatabase();
  const [people, years] = await Promise.all([
    db.collection("people").find().collation({ locale: "tr" }).sort({ name: 1 }).toArray(),
    db.collection("team_years").find().sort({ order: -1 }).toArray(),
  ]);
  const year = years.find((y) => y._id === yearParam) ?? years[0];
  const showPeople = tab === "people";

  return (
    <>
      <h1>Ekip</h1>
      {msg && <p className={styles.msg} role="status">{msg}</p>}
      {err && <p className={`${styles.msg} ${styles.error}`} role="alert">{err}</p>}

      <div className={styles.tabs}>
        <Link href="/admin/team" aria-current={!showPeople ? "page" : undefined}>Yıllar</Link>
        <Link href="/admin/team?tab=people" aria-current={showPeople ? "page" : undefined}>Kişiler ({people.length})</Link>
      </div>

      {showPeople ? <People people={people} years={years} q={q} /> : (
        <>
          <div className={styles.toolbar}>
            {years.map((y) => (
              <Link key={y._id} href={`/admin/team?year=${y._id}`} className={styles.chip}
                aria-current={y._id === year?._id ? "true" : undefined}>{y._id}</Link>
            ))}
            <details className={styles.pop}>
              <summary className={styles.linkBtn}>+ Yeni yıl</summary>
              <form action={createYearAction} className={styles.popBody}>
                <input name="year" placeholder="2026-2027" required pattern="\d{4}-\d{4}" aria-label="Yeni yıl" />
                <button>Oluştur</button>
              </form>
            </details>
          </div>
          {year ? <YearPanel y={year} people={people} /> : <p className={styles.empty}>Henüz yıl yok. Bir yıl oluşturun, kişi ekleyin, sonra yayınlayın.</p>}
        </>
      )}
    </>
  );
}

const personOf = (people, id) => people.find((p) => p._id.equals(id));

function YearPanel({ y, people }) {
  return (
    <>
      <div className={styles.statusBar}>
        <span className={`${styles.pill} ${y.published ? styles.live : ""}`}>
          {y.published ? "Sitede görünür" : "Sitede gizli"}
        </span>
        <form action={setPublishedAction}>
          <input type="hidden" name="year" value={y._id} />
          <input type="hidden" name="published" value={y.published ? "0" : "1"} />
          <button className={y.published ? styles.ghost : undefined}>{y.published ? "Gizle" : "Yayınla"}</button>
        </form>
        <details className={styles.pop}>
          <summary className={styles.linkBtn}>Yılı sil…</summary>
          <form action={deleteYearAction} className={styles.popBody}>
            <input type="hidden" name="year" value={y._id} />
            <span>{y._id} yılı, yönetim kurulu ve grupları silinsin mi?</span>
            <button className={styles.danger}>Evet, sil</button>
          </form>
        </details>
      </div>

      <Block title="Yönetim Kurulu">
        <Rows>
          {y.board.map((s, i) => (
            <Row key={String(s.personId)} person={personOf(people, s.personId)} note={s.title}>
              <Move year={y._id} personId={s.personId} i={i} n={y.board.length} />
              <Remove action={removeBoardAction} year={y._id} personId={s.personId} />
            </Row>
          ))}
        </Rows>
        <form action={addBoardAction} className={styles.addRow}>
          <input type="hidden" name="year" value={y._id} />
          <PersonSelect people={people} />
          <input name="title" placeholder="Unvan (örn. Genel Başkan)" required maxLength={80} />
          <button>Ekle</button>
        </form>
      </Block>

      {y.groups.map((g) => (
        <Block key={g.name} title={g.name} action={
          <form action={removeGroupAction}>
            <input type="hidden" name="year" value={y._id} />
            <input type="hidden" name="group" value={g.name} />
            <button className={styles.linkBtn}>Grubu sil</button>
          </form>
        }>
          <Rows>
            {g.leader && (
              <Row person={personOf(people, g.leader.personId)} note="Lider">
                <Remove action={removeGroupPersonAction} year={y._id} group={g.name} role="leader" personId={g.leader.personId} />
              </Row>
            )}
            {g.members.map((s, i) => (
              <Row key={String(s.personId)} person={personOf(people, s.personId)}>
                <Move year={y._id} group={g.name} personId={s.personId} i={i} n={g.members.length} />
                <Remove action={removeGroupPersonAction} year={y._id} group={g.name} role="member" personId={s.personId} />
              </Row>
            ))}
          </Rows>
          <form action={addGroupPersonAction} className={styles.addRow}>
            <input type="hidden" name="year" value={y._id} />
            <input type="hidden" name="group" value={g.name} />
            <PersonSelect people={people} />
            <select name="role" aria-label="Rol">
              <option value="member">Üye</option>
              <option value="leader">Lider</option>
            </select>
            <button>Ekle</button>
          </form>
        </Block>
      ))}

      <form action={addGroupAction} className={styles.addRow}>
        <input type="hidden" name="year" value={y._id} />
        <input name="name" placeholder="Yeni grup adı (örn. CS)" required maxLength={40} />
        <button className={styles.ghost}>Grup ekle</button>
      </form>
    </>
  );
}

function Block({ title, action, children }) {
  return (
    <section className={styles.block}>
      <header><h2>{title}</h2>{action}</header>
      {children}
    </section>
  );
}

function Rows({ children }) {
  const items = Array.isArray(children) ? children.flat().filter(Boolean) : children;
  return items?.length ? <ul className={styles.rows}>{children}</ul> : <p className={styles.muted}>Henüz kimse yok.</p>;
}

function Row({ person, note, children }) {
  return (
    <li>
      <Avatar person={person} />
      <span className={styles.grow}>{person?.name ?? "(silinmiş kişi)"}{note && <small>{note}</small>}</span>
      {children}
    </li>
  );
}

function People({ people, years, q }) {
  const needle = q.trim().toLocaleLowerCase("tr");
  const shown = needle ? people.filter((p) => p.name.toLocaleLowerCase("tr").includes(needle)) : people;
  const used = new Map();
  for (const y of years) {
    const slots = [...y.board, ...y.groups.flatMap((g) => [...(g.leader ? [g.leader] : []), ...g.members])];
    for (const s of slots) used.set(String(s.personId), [...new Set([...(used.get(String(s.personId)) ?? []), y._id])]);
  }
  return (
    <>
      <div className={styles.toolbar}>
        <form className={styles.search} role="search">
          <input type="hidden" name="tab" value="people" />
          <input name="q" defaultValue={q} placeholder="İsme göre ara" aria-label="Kişi ara" />
        </form>
        <details className={styles.pop}>
          <summary className={styles.primaryBtn}>+ Kişi ekle</summary>
          <form action={savePersonAction} className={styles.popBody}>
            <PersonFields />
            <button>Kişi ekle</button>
          </form>
        </details>
      </div>

      {shown.length === 0 && <p className={styles.empty}>{needle ? "Aramayla eşleşen kimse yok." : "Henüz kişi yok."}</p>}
      <ul className={styles.rows}>
        {shown.map((p) => (
          <li key={String(p._id)}>
            <details className={styles.personRow}>
              <summary>
                <Avatar person={p} />
                <span className={styles.grow}>{p.name}
                  <small>{used.get(String(p._id))?.join(", ") ?? "Hiçbir yılda yok"}</small></span>
                <span className={styles.linkBtn}>Düzenle</span>
              </summary>
              <form action={savePersonAction} className={styles.editForm}>
                <input type="hidden" name="id" value={String(p._id)} />
                <PersonFields person={p} />
                {p.photoKey && <label className={styles.check}><input type="checkbox" name="removePhoto" /> Mevcut fotoğrafı kaldır</label>}
                <div className={styles.inline}><button>Kaydet</button></div>
              </form>
              <form action={deletePersonAction} className={styles.editForm}>
                <input type="hidden" name="id" value={String(p._id)} />
                <button className={styles.linkBtn}>{p.name} kişisini sil</button>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}

function Avatar({ person }) {
  if (person?.photoKey) return <img src={photoUrl(person.photoKey)} alt="" width="40" height="40" className={styles.avatar} loading="lazy" />;
  return <span className={styles.avatar} aria-hidden="true">{(person?.name ?? "?").slice(0, 1).toLocaleUpperCase("tr")}</span>;
}

function PersonFields({ person }) {
  return (
    <>
      <label>İsim
        <input name="name" defaultValue={person?.name} required minLength={2} maxLength={80} />
      </label>
      <label>LinkedIn adresi (isteğe bağlı)
        <input name="linkedin" type="url" defaultValue={person?.linkedin ?? ""} placeholder="https://www.linkedin.com/in/…" />
      </label>
      <label>{person ? "Fotoğrafı değiştir (isteğe bağlı)" : "Fotoğraf (isteğe bağlı, en fazla 3,5 MB)"}
        <input name="photo" type="file" accept="image/*" />
      </label>
    </>
  );
}

function PersonSelect({ people }) {
  return (
    <select name="personId" required aria-label="Kişi">
      <option value="">Kişi seçin…</option>
      {people.map((p) => <option key={String(p._id)} value={String(p._id)}>{p.name}</option>)}
    </select>
  );
}

function Move({ year, group, personId, i, n }) {
  if (n < 2) return null;
  return (
    <form action={moveAction} className={styles.move}>
      <input type="hidden" name="year" value={year} />
      {group && <input type="hidden" name="group" value={group} />}
      <input type="hidden" name="personId" value={String(personId)} />
      <button name="dir" value="up" disabled={i === 0} className={styles.linkBtn} aria-label="Yukarı taşı">↑</button>
      <button name="dir" value="down" disabled={i === n - 1} className={styles.linkBtn} aria-label="Aşağı taşı">↓</button>
    </form>
  );
}

function Remove({ action, personId, ...hidden }) {
  return (
    <form action={action}>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name="personId" value={String(personId)} />
      <button className={styles.linkBtn}>Kaldır</button>
    </form>
  );
}
