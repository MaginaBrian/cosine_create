import HeroSlider from "../components/HeroSlider";
import WorkGrid from "../components/WorkGrid";
import { PROJECTS } from "../data";
import "./Home.css";

export default function Home() {
  return (
    <>
      <HeroSlider />

      <section id="work" className="home-work">
        <WorkGrid projects={PROJECTS} />
      </section>

      <section id="intro" className="proof">
        <div className="container proof__row">
          <article>
            <p className="eyebrow">01</p>
            <h2>Creative, tailored service</h2>
            <p>A collaborator at every stage — not a factory waiting for a locked spec.</p>
          </article>
          <article>
            <p className="eyebrow">02</p>
            <h2>Low minimums</h2>
            <p>First samples and small runs with the same care as a full production order.</p>
          </article>
          <article>
            <p className="eyebrow">03</p>
            <h2>End to end</h2>
            <p>Fabric sourcing, sampling, production and distribution in one sequence.</p>
          </article>
        </div>
      </section>
    </>
  );
}
