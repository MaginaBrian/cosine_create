import { useState } from "react";
import { STAGES } from "../data";
import "./ProcessBoard.css";

export default function ProcessBoard({ heading = true }) {
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <div className="board">
      {heading && (
        <div className="section__head">
          <h2 className="section__title">The process is the experience.</h2>
          <p className="section__intro">
            Sourcing, craft and execution are shown — not claimed — so you can
            see how an idea moves from concept to creation.
          </p>
        </div>
      )}

      <ol className="board__steps">
        {STAGES.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i === active ? "is-active" : ""}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
            >
              <span>{s.id}</span>
              <strong>{s.name}</strong>
            </button>
          </li>
        ))}
      </ol>

      <div className="board__detail" aria-live="polite">
        <p className="eyebrow">Stage {stage.id}</p>
        <h3>{stage.title}</h3>
        <p>{stage.body}</p>
        <a className="link" href="#/process">
          Full process
        </a>
      </div>
    </div>
  );
}
