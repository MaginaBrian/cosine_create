import { useState } from "react";
import { STAGES } from "../data";
import "./Process.css";

const MAKING = {
  brief: "A conversation, a spec, constraints on the table. The project is named before a mill is called.",
  source: "Swatches, mills, trims. Material is chosen in the hand, against the use, not from a thumbnail.",
  sample: "Pattern, toile, stitch, comment. The sample room is where problems are solved in public.",
  produce: "Markers, cut, sew, press. The line is set to the approved sample — quantity does not change the standard.",
  distribute: "Measure, pack, label, ship. The last mile is documented so you always know where the work is.",
};

export default function Process() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Process</p>
          <h1>How an idea gets made.</h1>
          <p className="page-head__lede">
            Structure, type and sequence make a complex path simple to follow. Click a stage. See the work behind it.
          </p>
        </div>
      </header>

      <section className="section process-page">
        <div className="container process-page__layout">
          <ol className="process-page__nav">
            {STAGES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={i === active ? "is-active" : ""}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                >
                  <span>{s.id}</span>
                  {s.name}
                </button>
              </li>
            ))}
          </ol>

          <article className="process-page__body" aria-live="polite">
            <p className="eyebrow">Stage {stage.id} of 05</p>
            <h2>{stage.title}</h2>
            <p className="process-page__copy">{stage.body}</p>
            <div className={`process-page__viz process-page__viz--${stage.key}`} aria-hidden="true" />
            <p className="process-page__making">{MAKING[stage.key]}</p>
            <a className="btn" href="#/start">
              Start at this stage
            </a>
          </article>
        </div>
      </section>
    </>
  );
}
