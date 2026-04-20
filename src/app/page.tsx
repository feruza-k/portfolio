import { Navigation } from "@/components/layout/Navigation";
import { Landing } from "@/components/scenes/Landing";
import { Agent } from "@/components/scenes/Agent";
import { Map } from "@/components/scenes/Map";
import { CaseStudies } from "@/components/scenes/CaseStudies";
import { Thoughts } from "@/components/scenes/Thoughts";
import { About } from "@/components/scenes/About";
import { Footer } from "@/components/layout/Footer";
import { ParticleField } from "@/components/layout/ParticleField";

export default function Home() {
  return (
    <>
      <ParticleField />
      <div className="relative z-10">
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
      </div>
    </>
  );
}
