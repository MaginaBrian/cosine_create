import { useState } from "react";
import { ORDERS, STAGES } from "../data";
import "./Portal.css";

export default function Portal({ user, onLogin, onLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState(ORDERS[0].id);

  const onSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, brand: "Studio" });
  };

  if (!user) {
    return (
      <>
        <header className="page-head">
          <div className="container">
            <p className="eyebrow">Client portal</p>
            <h1>The same system, for the work in motion.</h1>
            <p className="page-head__lede">
              Visitors explore capability. Clients manage orders, samples and production in the same visual language — not a separate tool.
            </p>
          </div>
        </header>

        <section className="section">
          <div className="container portal-login">
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="portal-email">Email</label>
                <input
                  id="portal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label htmlFor="portal-password">Password</label>
                <input
                  id="portal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button className="btn" type="submit">
                Enter portal
              </button>
              <p className="portal-login__hint">
                Prototype access — any email and password will sign you in.
              </p>
            </form>
          </div>
        </section>
      </>
    );
  }

  const order = ORDERS.find((o) => o.id === selected) || ORDERS[0];
  const currentIndex = STAGES.findIndex((s) => s.key === order.stage);

  return (
    <>
      <header className="page-head">
        <div className="container portal-head">
          <div>
            <p className="eyebrow">Client portal</p>
            <h1>Orders in production.</h1>
            <p className="page-head__lede">
              Signed in as {user.email}. The stages below are the same path as the public process — brief to distribution.
            </p>
          </div>
          <button type="button" className="btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="section portal-dash">
        <div className="container portal-dash__layout">
          <div>
            <p className="eyebrow">Active orders</p>
            <ul className="order-list">
              {ORDERS.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className={o.id === order.id ? "is-active" : ""}
                    onClick={() => setSelected(o.id)}
                    aria-pressed={o.id === order.id}
                  >
                    <span>{o.id}</span>
                    <strong>{o.name}</strong>
                    <em>
                      {o.qty} pcs · {STAGES.find((s) => s.key === o.stage)?.name}
                    </em>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <article className="order-detail">
            <p className="eyebrow">{order.id}</p>
            <h2>{order.name}</h2>
            <p className="order-detail__meta">
              {order.qty} units · Updated {order.updated}
            </p>
            <p className="order-detail__note">{order.note}</p>

            <ol className="order-track">
              {STAGES.map((s, i) => {
                const state = i < currentIndex ? "done" : i === currentIndex ? "now" : "next";
                return (
                  <li key={s.id} className={`order-track__item is-${state}`}>
                    <span>{s.id}</span>
                    <div>
                      <strong>{s.name}</strong>
                      <em>
                        {state === "done" && "Complete"}
                        {state === "now" && "In progress"}
                        {state === "next" && "Upcoming"}
                      </em>
                    </div>
                  </li>
                );
              })}
            </ol>

            <a className="btn" href="#/start">
              Start another project
            </a>
          </article>
        </div>
      </section>
    </>
  );
}
