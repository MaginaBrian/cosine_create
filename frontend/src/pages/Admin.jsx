import { useEffect, useMemo, useRef, useState } from "react";
import { fetchOrders, updateOrderStage, deleteOrder, downloadBlob } from "../api";
import { GARMENTS, formatSizeRun } from "../measurements";
import "./Portal.css";
import "./Admin.css";

const ADMIN_STAGES = [
  { key: "produce", name: "Production" },
  { key: "distribute", name: "Dispatch" },
];

function garmentLabel(order) {
  const match = GARMENTS.find((g) => g.id === order.garment);
  return match?.name || order.product?.name || "—";
}

function adminStage(key) {
  if (key === "distribute" || key === "dispatch") return "distribute";
  return "produce";
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

function companyKey(order) {
  return (order.client_slug || order.brand || "other").toLowerCase();
}

function companyLabel(order) {
  return order.brand || order.user?.brand || order.client_slug || "Other";
}

function groupByCompany(orders) {
  const map = new Map();
  for (const order of orders) {
    const key = companyKey(order);
    if (!map.has(key)) {
      map.set(key, { key, label: companyLabel(order), orders: [] });
    }
    map.get(key).orders.push(order);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function OrderRows({ orders, savingId, onStageChange, onDelete }) {
  if (!orders.length) {
    return (
      <tr>
        <td colSpan={12}>No orders yet.</td>
      </tr>
    );
  }

  return orders.map((o) => (
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
            value={adminStage(o.stage)}
            disabled={savingId === o.id}
            onChange={(e) => onStageChange(o, e.target.value)}
          >
            {ADMIN_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </td>
      <td>
        <button
          type="button"
          className="admin-delete"
          disabled={savingId === o.id}
          onClick={() => onDelete(o)}
        >
          Delete
        </button>
      </td>
    </tr>
  ));
}

export default function Admin({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const primedCompanies = useRef(false);

  useEffect(() => {
    fetchOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message));
  }, []);

  const companies = useMemo(() => groupByCompany(orders), [orders]);

  useEffect(() => {
    if (primedCompanies.current || companies.length === 0) return;
    primedCompanies.current = true;
    setOpenKeys(new Set([companies[0].key]));
  }, [companies]);

  const onStageChange = async (order, next) => {
    const current = adminStage(order.stage);
    if (next === current) return;
    setError("");
    setNotice("");
    setSavingId(order.id);
    try {
      const data = await updateOrderStage(order.id, next);
      setOrders((list) => list.map((row) => (row.id === order.id ? data.order : row)));
      const name = next === "distribute" ? "Dispatch" : "Production";
      setNotice(`${order.ref} is now ${name}. The client sees this on their orders.`);
    } catch (err) {
      setError(err.message || "Could not update stage");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (order) => {
    const ok = window.confirm(
      `Delete ${order.ref}? A completion PDF will download, then this order is removed.`
    );
    if (!ok) return;
    setError("");
    setNotice("");
    setSavingId(order.id);
    try {
      const { blob, filename } = await deleteOrder(order.id);
      downloadBlob(blob, filename);
      setOrders((list) => list.filter((row) => row.id !== order.id));
      setNotice(`${order.ref} completed and removed. ${filename} downloaded.`);
    } catch (err) {
      setError(err.message || "Could not delete order");
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
              Signed in as {user?.name}. Open a company to see its orders. Production or Dispatch
              shows on the client’s page as soon as you change it. Delete a completed order to
              download a completion PDF and remove it.
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
          {companies.length === 0 ? (
            <p className="admin-empty">No orders yet.</p>
          ) : (
            <div className="admin-companies">
              {companies.map((company) => (
                <details
                  key={company.key}
                  className="admin-company"
                  open={openKeys.has(company.key)}
                  onToggle={(e) => {
                    const nextOpen = e.currentTarget.open;
                    setOpenKeys((keys) => {
                      if (keys.has(company.key) === nextOpen) return keys;
                      const next = new Set(keys);
                      if (nextOpen) next.add(company.key);
                      else next.delete(company.key);
                      return next;
                    });
                  }}
                >
                  <summary>
                    <span className="admin-company__name">{company.label}</span>
                    <span className="admin-company__count">
                      {company.orders.length} {company.orders.length === 1 ? "order" : "orders"}
                    </span>
                    <span className="admin-company__mark" aria-hidden="true" />
                  </summary>
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
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        <OrderRows
                          orders={company.orders}
                          savingId={savingId}
                          onStageChange={onStageChange}
                          onDelete={onDelete}
                        />
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
