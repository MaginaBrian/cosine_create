import { SERVICES } from "../data";
import "./Services.css";

export default function Services() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Services</p>
          <h1>What we make possible.</h1>
          <p className="page-head__lede">
            An end-to-end manufacturing path, tailored to the project in front of us — not a menu of extras around a factory booking.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <ol className="svc">
            {SERVICES.map((s) => (
              <li key={s.id} className="svc__row">
                <p className="eyebrow">{s.id}</p>
                <div>
                  <h2>{s.name}</h2>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band scale">
        <div className="container scale__inner">
          <h2>Built to scale with you.</h2>
          <p>
            The same system holds a first sample, a fifty-unit run and a larger production. Visual language, process and care stay consistent as the order grows.
          </p>
          <a className="btn" href="#/start">
            Start a project
          </a>
        </div>
      </section>
    </>
  );
}
