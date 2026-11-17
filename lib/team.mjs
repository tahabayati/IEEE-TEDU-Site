import "server-only";
import { getDatabase } from "./mongodb.mjs";

/*
Collections:
  people:     { _id, name, linkedin: string|null, photoKey: string|null, createdAt }
  team_years: { _id: "2025-2026", order: 2025, published: bool,
                board:  [{ personId, title }],                      // Genel Başkan etc.
                groups: [{ name: "CS", leader: { personId, title } | null,
                           members: [{ personId, title }] }] }
Photos live in B2 under content-hashed keys (team/<sha256>.webp) and are served by /media/[...key].
*/

export const photoUrl = (key) => (key ? `/media/${key}` : "");

// Published years, oldest first, with each personId replaced by { name, linkedin, photo, title }.
export async function getPublishedTeamYears() {
  const db = await getDatabase();
  const years = await db.collection("team_years").find({ published: true }).sort({ order: 1 }).toArray();
  const ids = years.flatMap((y) => [
    ...y.board, ...y.groups.flatMap((g) => [...(g.leader ? [g.leader] : []), ...g.members]),
  ].map((m) => m.personId));
  const people = new Map(
    (await db.collection("people").find({ _id: { $in: ids } }).toArray()).map((p) => [String(p._id), p]),
  );
  // A slot whose person was deleted disappears instead of breaking the page.
  const resolve = (slot) => {
    const p = slot && people.get(String(slot.personId));
    return p ? { name: p.name, linkedin: p.linkedin, photo: photoUrl(p.photoKey), title: slot.title } : null;
  };
  return years.map((y) => ({
    id: y._id,
    board: y.board.map(resolve).filter(Boolean),
    groups: y.groups.map((g) => ({
      name: g.name,
      leader: resolve(g.leader),
      members: g.members.map(resolve).filter(Boolean),
    })),
  }));
}
