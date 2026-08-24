import { useState } from "react";
import { STAGES } from "../data";
import "./Start.css";

const EMPTY = {
  name: "",
  brand: "",
  email: "",
  product: "Apparel",
  qty: "",
  stage: "idea",
  notes: "",
};

export default function Start() {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Start a project</p>
          <h1>Tell us what you want to make.</h1>
          <p className="page-head__lede">
            Low minimums are welcome. Share where you are — idea, sample, or ready to produce — and we will shape the path around the project.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container start">
          {sent ? (
            <div className="start__done">
              <p className="eyebrow">Received</p>
              <h2>Your project is the focus from here.</h2>
              <p>
                We’ll review what you’ve sent and come back with a clear next step — sourcing, sampling or a production plan. Same care, regardless of quantity.
              </p>
              <a className="btn" href="#/portal">
                Open the client portal
              </a>
            </div>
          ) : (
            <>
              <form className="start__form" onSubmit={onSubmit}>
                <div className="start__grid">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" value={form.name} onChange={onChange} required autoComplete="name" />
                  </div>
                  <div className="field">
                    <label htmlFor="brand">Brand</label>
                    <input id="brand" name="brand" value={form.brand} onChange={onChange} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" />
                </div>
                <div className="start__grid">
                  <div className="field">
                    <label htmlFor="product">What are you making?</label>
                    <select id="product" name="product" value={form.product} onChange={onChange}>
                      <option>Apparel</option>
                      <option>Accessories</option>
                      <option>Home</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="qty">Approximate quantity</label>
                    <input
                      id="qty"
                      name="qty"
                      value={form.qty}
                      onChange={onChange}
                      placeholder="From 50"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="stage">Where are you?</label>
                  <select id="stage" name="stage" value={form.stage} onChange={onChange}>
                    <option value="idea">I have an idea</option>
                    <option value="sample">I have a sample</option>
                    <option value="produce">Ready to produce</option>
                    <option value="reorder">Reorder / scale</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="notes">The project</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={onChange}
                    placeholder="Fabric, silhouette, timeline, anything that matters."
                  />
                </div>
                <button className="btn" type="submit">
                  Send project
                </button>
              </form>

              <aside className="start__aside">
                <p className="eyebrow">What happens next</p>
                <ol>
                  {STAGES.map((s) => (
                    <li key={s.id}>
                      <span>{s.id}</span>
                      <strong>{s.name}</strong>
                    </li>
                  ))}
                </ol>
                <p className="start__aside-note">
                  You will not be asked to skip steps. If you already have a sample, we start there.
                </p>
              </aside>
            </>
          )}
        </div>
      </section>
    </>
  );
}
