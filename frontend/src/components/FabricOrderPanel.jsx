import { useEffect, useState } from "react";
import { createOrder, fetchOrders } from "../api";
import { lineSummary, quantityLabel } from "../textiles";
import "./OrderPanel.css";

function isPhone(value) {
  return String(value || "").replace(/\D/g, "").length >= 7;
}

export default function FabricOrderPanel({ user, fabrics, selected, onSelect }) {
  const [orders, setOrders] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("m");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const load = async () => {
    const data = await fetchOrders();
    setOrders(data.orders || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
    const refresh = () => {
      fetchOrders()
        .then((data) => setOrders(data.orders || []))
        .catch(() => {});
    };
    const timer = setInterval(refresh, 5000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    if (!selected) {
      setError("Choose a fabric line.");
      return;
    }
    const qty = Number(quantity);
    if (qty < 1) {
      setError("Enter a quantity of at least 1.");
      return;
    }
    if (!isPhone(phone)) {
      setError("Enter a phone number.");
      return;
    }
    setBusy(true);
    try {
      await createOrder({
        fabric_id: selected.id,
        name: user.name,
        brand: user.brand,
        email: user.email,
        phone: phone.trim(),
        quantity: qty,
        unit,
        stage: "produce",
        notes: notes.trim() || undefined,
      });
      setSent(true);
      setQuantity("");
      setNotes("");
      await load();
    } catch (err) {
      setError(err.message || "Could not send order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="order-panel" aria-label="Place a fabric order">
      <div className="order-panel__intro">
        <p className="eyebrow">Fabric order</p>
        <h2>Order a line.</h2>
        <p>
          Choose a fabric from the list, set metres or kilos, and send. The studio sees it on the
          admin orders list. Public visitors do not see this.
        </p>
      </div>

      <form className="order-panel__form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="fabric-line">Line</label>
          <select
            id="fabric-line"
            value={selected?.id || ""}
            onChange={(e) => {
              const next = fabrics.find((row) => String(row.id) === e.target.value);
              onSelect(next || null);
              setSent(false);
            }}
            required
          >
            <option value="">Select a fabric</option>
            {fabrics.map((row) => (
              <option key={row.id} value={row.id}>
                {lineSummary(row)}
              </option>
            ))}
          </select>
        </div>

        {selected ? <p className="order-panel__garment">{lineSummary(selected)}</p> : null}

        <div className="order-size">
          <div className="field">
            <label htmlFor="fabric-qty">Quantity</label>
            <input
              id="fabric-qty"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="fabric-unit">Unit</label>
            <select id="fabric-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="m">Metres</option>
              <option value="kg">Kilograms</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="fabric-phone">Phone number</label>
          <input
            id="fabric-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="fabric-notes">Notes</label>
          <textarea
            id="fabric-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery window, colour when you have a card, anything else."
          />
        </div>

        {error ? <p className="order-panel__error">{error}</p> : null}
        {sent ? <p className="order-panel__ok">Order received. Admin can see it now.</p> : null}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send order"}
        </button>
      </form>

      {orders.length ? (
        <div className="order-panel__history">
          <p className="eyebrow">Your orders</p>
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                <span>{o.ref}</span>
                <strong>{lineSummary(o.fabric_line) || o.fabric || "Fabric"}</strong>
                <em>{quantityLabel(o)}</em>
                <b
                  className={`order-status${
                    o.stage === "distribute" || o.stage === "dispatch"
                      ? " order-status--dispatch"
                      : ""
                  }`}
                >
                  {o.stage === "distribute" || o.stage === "dispatch" ? "Dispatch" : "Production"}
                </b>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
