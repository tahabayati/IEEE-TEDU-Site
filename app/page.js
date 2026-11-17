import SiteInteractions from "./components/SiteInteractions";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Committees from "./components/Committees";
import Activities from "./components/Activities";
import TeamSection from "./components/TeamSection";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import { getPublishedTeamYears } from "../lib/team.mjs";

// Team data comes from MongoDB; the page is rebuilt at most once an hour.
export const revalidate = 3600;

export const metadata = {
  title: "IEEE TEDU | Mühendislikte İlerleme, Değişimde İlham",
};

export default async function Page() {
  const years = await getPublishedTeamYears();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Committees />
        <Activities />
        <TeamSection years={years} />
      </main>
      <Footer />
      <FloatingContact />
      <SiteInteractions />
    </>
  );
}
