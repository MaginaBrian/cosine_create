import { useEffect, useMemo, useRef, useState } from "react";
import { fetchOrders, fetchInquiries, deleteInquiry, updateOrderStage, deleteOrder, downloadBlob } from "../api";
import { GARMENTS, formatSizeRun } from "../measurements";
import { itemName, orderItems } from "../orderItems";
import { canMoveOrderStage, orderStage, orderStageName, rowStageClass, stageChoices } from "../orderStages";
import { lineSummary, quantityLabel } from "../textiles";
import "./Portal.css";
import "./Admin.css";

const INQUIRY_STAGES = {
  idea: "I have an idea",
  sample: "I have a sample",
  produce: "Ready to produce",
  buy: "Ready to buy",
  reorder: "Reorder / scale",
};

function garmentLabel(order) {
  if (order.fabric_line || order.fabric_id) {
    const mill = order.fabric_line?.code
      ? `${order.fabric_line.supplier ? `${order.fabric_line.supplier} ` : ""}${order.fabric_line.code}`
      : "";
    const summary = lineSummary(order.fabric_line) || order.fabric || "Fabric";
    return mill ? `${mill} · ${summary}` : summary;
  }
  const items = orderItems(order);
  if (items.length > 1) {
    return items.map(itemName).join(", ");
  }
  const match = GARMENTS.find((g) => g.id === order.garment);
  return match?.name || order.product?.name || "—";
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

function orderDateKey(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ordersOnDate(list, date) {
  if (!date) return list;
  return list.filter((o) => orderDateKey(o.created_at) === date);
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

function StageCell({ order, savingId, onStageChange, role }) {
  const current = orderStage(order.stage);
  const choices = stageChoices(role, current);
  const locked = choices.length < 2;
  return (
    <td className="admin-item-cell">
      <label className="admin-stage">
        <span className="sr-only">Stage for {order.ref}</span>
        <select
          value={current}
          disabled={locked || savingId === order.id}
          onChange={(e) => onStageChange(order, e.target.value)}
        >
          {choices.map((s) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </td>
  );
}

function DeleteCell({ order, savingId, onDelete, show }) {
  return (
    <td className="admin-item-cell">
      {show ? (
        <button
          type="button"
          className="admin-delete"
          disabled={savingId === order.id}
          onClick={() => onDelete(order)}
        >
          Delete
        </button>
      ) : null}
    </td>
  );
}

function OrderMetaCells({ order, rowSpan }) {
  return (
    <>
      <td rowSpan={rowSpan}>{formatDateTime(order.created_at)}</td>
      <td rowSpan={rowSpan}>{order.ref}</td>
      <td rowSpan={rowSpan}>
        <strong>{order.contact_name || order.user?.name}</strong>
        <span>{order.email || order.user?.email}</span>
      </td>
      <td rowSpan={rowSpan}>{order.phone || "—"}</td>
    </>
  );
}

function itemLineCells(item, { rib, notes }) {
  return (
    <>
      <td className="admin-item-cell">{itemName(item)}</td>
      <td className="admin-item-cell">{`${item.quantity || 0} pcs`}</td>
      <td className="admin-item-cell">{formatSizeRun(item.sizes) || "—"}</td>
      <td className="admin-item-cell">{item.color || "—"}</td>
      <td className="admin-item-cell">{rib || "—"}</td>
      <td className="admin-item-cell">{item.height || "—"}</td>
      <td className="admin-item-cell">{item.fabric || "—"}</td>
      <td className="admin-item-cell">{notes}</td>
    </>
  );
}

function OrderRows({ orders, emptyLabel = "No orders yet.", savingId, onStageChange, onDelete, role, canDelete }) {
  const colSpan = canDelete ? 14 : 13;
  if (!orders.length) {
    return (
      <tr>
        <td colSpan={colSpan}>{emptyLabel}</td>
      </tr>
    );
  }

  return orders.flatMap((o) => {
    const items = o.fabric_id ? [] : orderItems(o);
    const stageClass = rowStageClass(o.stage);

    if (items.length > 1) {
      return items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <tr
            key={`${o.id}-${i}`}
            className={`admin-row-group${last ? " admin-row-group--last" : ""}${stageClass ? ` ${stageClass}` : ""}`}
          >
            {i === 0 ? <OrderMetaCells order={o} rowSpan={items.length} /> : null}
            {itemLineCells(item, {
              rib: o.rib,
              notes: i === 0 ? o.notes || "—" : "",
            })}
            <StageCell order={o} savingId={savingId} onStageChange={onStageChange} role={role} />
            {canDelete ? (
              <DeleteCell order={o} savingId={savingId} onDelete={onDelete} show={i === 0} />
            ) : null}
          </tr>
        );
      });
    }

    return [
      <tr key={o.id} className={stageClass || undefined}>
        <OrderMetaCells order={o} />
        <td>{garmentLabel(o)}</td>
        <td>{quantityLabel(o)}</td>
        <td>{formatSizeRun(o.sizes) || "—"}</td>
        <td>{o.color || "—"}</td>
        <td>{o.rib || "—"}</td>
        <td>{o.height || "—"}</td>
        <td>{o.fabric || "—"}</td>
        <td>{o.notes || "—"}</td>
        <StageCell order={o} savingId={savingId} onStageChange={onStageChange} role={role} />
        {canDelete ? <DeleteCell order={o} savingId={savingId} onDelete={onDelete} show /> : null}
      </tr>,
    ];
  });
}

export default function Admin({ user, onLogout }) {
  const isAdmin = user?.role === "admin";
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [savingInquiryId, setSavingInquiryId] = useState(null);
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const [dateByCompany, setDateByCompany] = useState({});
  const primedCompanies = useRef(false);

  useEffect(() => {
    fetchOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message));
    if (!isAdmin) return;
    fetchInquiries()
      .then((data) => setInquiries(data.inquiries || []))
      .catch((err) => setError(err.message));
  }, [isAdmin]);

  const companies = useMemo(() => groupByCompany(orders), [orders]);

  useEffect(() => {
    if (primedCompanies.current || companies.length === 0) return;
    primedCompanies.current = true;
    setOpenKeys(new Set([companies[0].key]));
  }, [companies]);

  const onStageChange = async (order, next) => {
    const current = orderStage(order.stage);
    if (next === current) return;
    if (!canMoveOrderStage(user?.role, current, next)) return;
    setError("");
    setNotice("");
    setSavingId(order.id);
    try {
      const data = await updateOrderStage(order.id, next);
      setOrders((list) => list.map((row) => (row.id === order.id ? data.order : row)));
      const mailed = data.mail?.sent || data.mail?.logged;
      setNotice(
        mailed
          ? `${order.ref} is now ${orderStageName(next)}. A progress email was sent to the client.`
          : `${order.ref} is now ${orderStageName(next)}. The client sees this on their orders.`
      );
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

  const onDeleteInquiry = async (row) => {
    const ok = window.confirm(
      `Delete ${row.brand} (${row.email})? This enquiry will be removed.`
    );
    if (!ok) return;
    setError("");
    setNotice("");
    setSavingInquiryId(row.id);
    try {
      await deleteInquiry(row.id);
      setInquiries((list) => list.filter((item) => item.id !== row.id));
      setNotice(`${row.contact_name} removed from potential customers.`);
    } catch (err) {
      setError(err.message || "Could not delete enquiry");
    } finally {
      setSavingInquiryId(null);
    }
  };

  return (
    <>
      <header className="page-head">
        <div className="container portal-head">
          <div>
            <p className="eyebrow">{user?.role === "produce" ? "Production" : user?.role === "dispatch" ? "Dispatch" : "Admin"}</p>
            <h1>All orders.</h1>
            <p className="page-head__lede">
              {user?.role === "produce"
                ? `Signed in as ${user?.name}. You can move an order from Processing to Production. Production rows turn blue.`
                : user?.role === "dispatch"
                  ? `Signed in as ${user?.name}. You can move an order from Production to Dispatch. Dispatch rows turn green.`
                  : `Signed in as ${user?.name}. Open a company to see its orders, and search a date to
              show only that day’s orders for that client. Processing stays black and white,
              Production turns the row blue, and Dispatch turns it green. Delete a completed order
              to download a completion PDF and remove it.`}
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
              {companies.map((company) => {
                const onDate = dateByCompany[company.key] || "";
                const visible = ordersOnDate(company.orders, onDate);
                const dateId = `admin-date-${company.key}`;
                return (
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
                      {onDate
                        ? `${visible.length} of ${company.orders.length} ${company.orders.length === 1 ? "order" : "orders"}`
                        : `${company.orders.length} ${company.orders.length === 1 ? "order" : "orders"}`}
                    </span>
                    <span className="admin-company__mark" aria-hidden="true" />
                  </summary>
                  <div className="field admin-company__date">
                    <label htmlFor={dateId}>Search by date</label>
                    <input
                      id={dateId}
                      type="date"
                      value={onDate}
                      onChange={(e) =>
                        setDateByCompany((dates) => ({
                          ...dates,
                          [company.key]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order no</th>
                          <th>Who</th>
                          <th>Phone</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Size</th>
                          <th>Color</th>
                          <th>Rib</th>
                          <th>Height</th>
                          <th>Apparel fabric</th>
                          <th>Notes</th>
                          <th>Stage</th>
                          {isAdmin ? <th>Delete</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        <OrderRows
                          orders={visible}
                          emptyLabel={onDate ? "No orders on this date." : "No orders yet."}
                          savingId={savingId}
                          onStageChange={onStageChange}
                          onDelete={onDelete}
                          role={user?.role}
                          canDelete={isAdmin}
                        />
                      </tbody>
                    </table>
                  </div>
                </details>
                );
              })}
            </div>
          )}

          {isAdmin ? (
          <div className="admin-leads">
            <p className="eyebrow">Start a project</p>
            <h2>Potential customers.</h2>
            <p className="admin-leads__lede">
              Anyone who fills in Start a project appears here — name, phone, brand, and where they are.
            </p>
            {inquiries.length === 0 ? (
              <p className="admin-empty">No project enquiries yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--leads">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Who</th>
                      <th>Phone</th>
                      <th>Brand</th>
                      <th>Making</th>
                      <th>Qty</th>
                      <th>Where they are</th>
                      <th>The project</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateTime(row.created_at)}</td>
                        <td>
                          <strong>{row.contact_name}</strong>
                          <span>{row.email}</span>
                        </td>
                        <td>{row.phone || "—"}</td>
                        <td>{row.brand}</td>
                        <td>{row.making}</td>
                        <td>{row.quantity || "—"}</td>
                        <td>{INQUIRY_STAGES[row.stage] || row.stage}</td>
                        <td>{row.notes || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-delete"
                            disabled={savingInquiryId === row.id}
                            onClick={() => onDeleteInquiry(row)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
