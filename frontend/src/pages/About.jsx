import "./Studio.css";

const POINTS = [
  {
    id: "01",
    name: "A making studio",
    body: "Cosine Create is a contract manufacturer for founders and brands — a partner in the idea, not a factory waiting for a locked spec.",
  },
  {
    id: "02",
    name: "End to end",
    body: "Fabric sourcing, sampling, production and distribution sit in one sequence. The project stays in the same hands from first sample to carton.",
  },
  {
    id: "03",
    name: "The same care",
    body: "Low minimums without lowering the standard. A first run and a larger order are treated with the same attention on the line.",
  },
];

export default function About() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">About</p>
          <h1>How we think about making.</h1>
          <p className="page-head__lede">
            Capability is shown through process — not claimed through copy. The experience of making should hold the same imagination as the product that leaves the studio.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <ol className="studio-list">
            {POINTS.map((p) => (
              <li key={p.id}>
                <p className="eyebrow">{p.id}</p>
                <div>
                  <h2>{p.name}</h2>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
