import { notFound } from "next/navigation";
import WorkshopHub from "../../components/workshop/WorkshopHub";
import { getWorkshop, getWorkshopSlugs } from "../../../lib/workshops.mjs";

// Only slugs listed in content/workshops are valid; everything else is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => getWorkshopSlugs().map((slug) => ({ slug }));

export async function generateMetadata({ params }) {
  const w = getWorkshop((await params).slug);
  return w ? { title: `${w.title} | IEEE TEDU`, description: w.summary } : {};
}

export default async function Page({ params }) {
  const w = getWorkshop((await params).slug);
  if (!w) notFound();
  return <WorkshopHub w={w} />;
}
