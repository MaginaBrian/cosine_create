import { useEffect, useMemo, useState } from "react";
import { createOrder, fetchOrders, fetchProducts } from "../api";
import { STAGES } from "../data";
import "./Portal.css";
import "./Start.css";
import "./Studio.css";

const EMPTY = {
  name: "",
  brand: "",
  email: "",
  making: "Apparel",
  product_id: "",
  qty: "",
  stage: "idea",
  notes: "",
};

function groupProducts(products) {
  const categories = products.filter((p) => p.sku_kind === "category");
  const looks = products.filter((p) => p.sku_kind !== "category");
  return { categories, looks };
}

export default function Studio({ user, onLogout }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    name: user?.name || "",
    brand: user?.brand || "",
    email: user?.email || "",
  }));
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [p, o] = await Promise.all([fetchProducts(), fetchOrders()]);
    setProducts(p.products || []);
    setOrders(o.orders || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const grouped = useMemo(() => groupProducts(products), [products]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await createOrder({
        product_id: Number(form.product_id),
        name: form.name,
        brand: form.brand,
        email: form.email,
        making: form.making,
        quantity: Number(form.qty),
        stage: form.stage,
        notes: form.notes,
      });
      setSent(true);
      await load();
    } catch (err) {
      setError(err.message || "Could not send project");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="page-head">
        <div className="container portal-head">
          <div>
            <p className="eyebrow">{user?.brand || "Studio"}</p>
            <h1>Tell us what you want to make.</h1>
            <p className="page-head__lede">
              Orders are limited to the {user?.brand} catalog. Low minimums are welcome. Share where you are — idea, sample, or ready to produce — and we will shape the path around the project.
            </p>
          </div>
          <button type="button" className="btn" onClick={onLogout}>
            Sign out
          </button>
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
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setSent(false);
                  setForm((f) => ({ ...f, product_id: "", qty: "", notes: "" }));
                }}
              >
                Send another project
              </button>
            </div>
          ) : (
            <>
              <form className="start__form" onSubmit={onSubmit}>
                <div className="start__grid">
                  <div className="field">
                    <label htmlFor="studio-name">Name</label>
                    <input
                      id="studio-name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="studio-brand">Brand</label>
                    <input id="studio-brand" name="brand" value={form.brand} onChange={onChange} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="studio-email">Email</label>
                  <input
                    id="studio-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="start__grid">
                  <div className="field">
                    <label htmlFor="studio-making">What are you making?</label>
                    <select id="studio-making" name="making" value={form.making} onChange={onChange}>
                      <option>Apparel</option>
                      <option>Accessories</option>
                      <option>Home</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="studio-qty">Approximate quantity</label>
                    <input
                      id="studio-qty"
                      name="qty"
                      type="number"
                      min="50"
                      value={form.qty}
                      onChange={onChange}
                      placeholder="From 50"
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="studio-product">Your catalog</label>
                  <select
                    id="studio-product"
                    name="product_id"
                    value={form.product_id}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select a {user?.brand} product</option>
                    {grouped.categories.length ? (
                      <optgroup label="Categories">
                        {grouped.categories.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    {grouped.looks.length ? (
                      <optgroup label="Looks">
                        {grouped.looks.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="studio-stage">Where are you?</label>
                  <select id="studio-stage" name="stage" value={form.stage} onChange={onChange}>
                    <option value="idea">I have an idea</option>
                    <option value="sample">I have a sample</option>
                    <option value="produce">Ready to produce</option>
                    <option value="reorder">Reorder / scale</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="studio-notes">The project</label>
                  <textarea
                    id="studio-notes"
                    name="notes"
                    value={form.notes}
                    onChange={onChange}
                    placeholder="Fabric, silhouette, timeline, anything that matters."
                  />
                </div>
                {error ? <p className="studio-error">{error}</p> : null}
                <button className="btn" type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send project"}
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

      {orders.length ? (
        <section className="section studio-orders">
          <div className="container">
            <p className="eyebrow">Your projects</p>
            <ul className="studio-order-list">
              {orders.map((o) => (
                <li key={o.id}>
                  <span>{o.ref}</span>
                  <strong>{o.product?.name}</strong>
                  <em>
                    {o.quantity} pcs · {STAGES.find((s) => s.key === o.stage)?.name || o.stage}
                  </em>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
