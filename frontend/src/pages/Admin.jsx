import { useEffect, useState } from "react";
import { fetchOrders, updateOrderStage } from "../api";
import { STAGES } from "../data";
import { GARMENTS, formatSizeRun } from "../measurements";
import "./Portal.css";
import "./Admin.css";

function garmentLabel(order) {
  const match = GARMENTS.find((g) => g.id === order.garment);
  return match?.name || order.product?.name || "—";
}

function canonicalStage(key) {
  if (key === "idea") return "brief";
  if (key === "reorder") return "produce";
  return key;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export default function Admin({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message));
  }, []);

  const onStageChange = async (order, next) => {
    const current = canonicalStage(order.stage);
    if (next === current) return;
    setError("");
    setNotice("");
    setSavingId(order.id);
    try {
      const data = await updateOrderStage(order.id, next);
      setOrders((list) => list.map((row) => (row.id === order.id ? data.order : row)));
      const mail = data.email || {};
      if (mail.sent) {
        setNotice(`Progress email sent to ${mail.to || order.email}.`);
      } else if (mail.logged) {
        setNotice(`Stage updated. Progress email logged for ${mail.to || order.email} (SMTP not configured).`);
      } else if (mail.skipped) {
        setNotice("Stage unchanged.");
      } else {
        setNotice(`Stage updated. Email not sent${mail.reason ? `: ${mail.reason}` : "."}`);
      }
    } catch (err) {
      setError(err.message || "Could not update stage");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <header className="page-head">
        <div className="container portal-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>All orders.</h1>
            <p className="page-head__lede">
              Signed in as {user?.name}. Moving a stage emails the client with progress.
            </p>
          </div>
          <button type="button" className="btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="section">
        <div className="container">
          {error ? <p className="admin-error">{error}</p> : null}
          {notice ? <p className="admin-ok">{notice}</p> : null}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order no</th>
                  <th>Who</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Height</th>
                  <th>Apparel fabric</th>
                  <th>Notes</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={11}>No orders yet.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td>{formatDateTime(o.created_at)}</td>
                      <td>{o.ref}</td>
                      <td>
                        <strong>{o.user?.name || o.contact_name}</strong>
                        <span>{o.user?.email || o.email}</span>
                      </td>
                      <td>{garmentLabel(o)}</td>
                      <td>{o.quantity}</td>
                      <td>{formatSizeRun(o.sizes) || "—"}</td>
                      <td>{o.color || "—"}</td>
                      <td>{o.height || "—"}</td>
                      <td>{o.fabric || "—"}</td>
                      <td>{o.notes || "—"}</td>
                      <td>
                        <label className="admin-stage">
                          <span className="sr-only">Stage for {o.ref}</span>
                          <select
                            value={canonicalStage(o.stage) || "brief"}
                            disabled={savingId === o.id}
                            onChange={(e) => onStageChange(o, e.target.value)}
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
