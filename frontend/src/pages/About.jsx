import { useState } from "react";
import "./About.css";

const POINTS = [
  {
    id: "studio",
    n: "01",
    title: "A making studio",
    body: "Cosine Create designs and manufactures apparel and other products that carry a brand's identity beyond it — a partner in the idea. We work with brands, businesses and founders who need more than a producer; they need someone who can shape the idea as much as build it.",
  },
  {
    id: "end-to-end",
    n: "02",
    title: "End to end",
    body: "Sourcing, sampling, production and distribution sit in one sequence. The project stays in the same hands from first sample to carton.",
  },
  {
    id: "care",
    n: "03",
    title: "The same care",
    body: "Low minimums without lowering the standard. A first run and a larger order are treated with the same attention on the line.",
  },
  {
    id: "kept",
    n: "04",
    title: "Made to be kept",
    body: "We work with brands, businesses and founders, but the standard we hold is set by whoever ends up wearing or carrying what we made. That's who this is really for.",
  },
];

export default function About() {
  const [openId, setOpenId] = useState(null);

  return (
    <article className="about">
      <p className="eyebrow about__kicker">About</p>
      <div className="about__layout">
        <div className="about__main">
          <h1>
            How we think
            <span>about making</span>
          </h1>
          <p className="about__lead">
            Making something is not a means to an end here.
          </p>
          <p>
            Watching an idea take shape, first as raw material then as a finished piece, is
            the reason Cosine Create exists.
          </p>
          <p>
            We treat this as a craft, not a task to get through. It takes time, and we give
            it that time.
          </p>
          <p>
            The making itself is the discipline. We hold it to that standard because the
            people who trust us with an idea deserve to see it come back to them done
            properly, and the people who end up wearing or carrying it deserve something
            worth keeping.
          </p>
        </div>

        <aside className="about__points" aria-label="How the studio works">
          <p className="eyebrow">How we work</p>
          {POINTS.map((point) => {
            const open = openId === point.id;
            return (
              <div
                key={point.id}
                className={`about-point${open ? " is-open" : ""}`}
                onMouseEnter={() => setOpenId(point.id)}
                onMouseLeave={() => setOpenId((id) => (id === point.id ? null : id))}
              >
                <button
                  type="button"
                  className="about-point__trigger"
                  aria-expanded={open}
                  aria-controls={`about-point-${point.id}`}
                  onClick={() => setOpenId(open ? null : point.id)}
                >
                  <span className="about-point__n">{point.n}</span>
                  <span className="about-point__title">{point.title}</span>
                  <span className="about-point__mark" aria-hidden="true" />
                </button>
                <div
                  className="about-point__panel"
                  id={`about-point-${point.id}`}
                  role="region"
                >
                  <p>{point.body}</p>
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </article>
  );
}
