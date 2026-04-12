import { Navigation } from "@/components/layout/Navigation";
import { Landing } from "@/components/scenes/Landing";
import { Agent } from "@/components/scenes/Agent";
import { Map } from "@/components/scenes/Map";
import { CaseStudies } from "@/components/scenes/CaseStudies";
import { Thoughts } from "@/components/scenes/Thoughts";
import { About } from "@/components/scenes/About";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Landing />
        <Agent />
        <Map />
        <CaseStudies />
        <Thoughts />
        <About />
        <Footer />
      </main>
    </>
  );
}
