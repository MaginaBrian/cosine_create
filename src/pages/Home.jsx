import HeroSlider from "../components/HeroSlider";
import ProcessBoard from "../components/ProcessBoard";
import WorkGrid from "../components/WorkGrid";
import { PROJECTS, SERVICES } from "../data";
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

      <section className="section">
        <div className="container">
          <ProcessBoard />
        </div>
      </section>

      <section className="section services-tease">
        <div className="container">
          <div className="section__head">
            <h2 className="section__title">Capability, in sequence.</h2>
            <p className="section__intro">
              Every service exists to move the client’s project forward. Nothing ornamental — each step has a job.
            </p>
          </div>
          <ul className="service-list">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <a href="#/services">
                  <span>{s.id}</span>
                  <strong>{s.name}</strong>
                  <em aria-hidden="true">→</em>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band principles">
        <div className="container">
          <p className="eyebrow">How we measure the work</p>
          <ul>
            <li>Every project is treated with the same care, regardless of size or order quantity.</li>
            <li>Capability is proven through process, not just claimed through copy.</li>
            <li>A genuine creative partner — not a manufacturer for hire.</li>
            <li>The experience of making reflects the same imagination as the final product.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
