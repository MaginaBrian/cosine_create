import { useEffect, useState } from "react";
import { fetchOrders } from "../api";
import { STAGES } from "../data";
import "./Portal.css";
import "./Admin.css";

function stageName(key) {
  return STAGES.find((s) => s.key === key)?.name || key;
}

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Admin({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <header className="page-head">
        <div className="container portal-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>All orders.</h1>
            <p className="page-head__lede">
              Signed in as {user?.name}. Every client brief, scoped to the catalog they own.
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
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Brand</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Stage</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No orders yet.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td>{formatWhen(o.created_at)}</td>
                      <td>
                        <strong>{o.user?.name || o.contact_name}</strong>
                        <span>{o.user?.email || o.email}</span>
                      </td>
                      <td>{o.brand}</td>
                      <td>{o.product?.name || "—"}</td>
                      <td>{o.quantity}</td>
                      <td>{stageName(o.stage)}</td>
                      <td>{o.notes || "—"}</td>
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
