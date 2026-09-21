import { useEffect, useId, useMemo, useState } from "react";
import { GARMENTS, formatSizeRun } from "../measurements";
import { itemDetail, itemsLabel, orderItems } from "../orderItems";
import { orderStageName } from "../orderStages";
import { lineSummary, quantityLabel } from "../textiles";

function formatOrderDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function productName(order) {
  if (order.fabric_line || order.fabric_id) {
    return lineSummary(order.fabric_line) || order.fabric || "Fabric";
  }
  return (
    itemsLabel(order) ||
    GARMENTS.find((g) => g.id === order.garment)?.name ||
    order.product?.name ||
    "Order"
  );
}

function optionLabel(order) {
  const qty = order.fabric_id ? quantityLabel(order) : `${order.quantity} pcs`;
  const when = formatOrderDate(order.created_at);
  return [order.ref, productName(order), qty, when].filter(Boolean).join(" · ");
}

export default function PastOrders({ orders }) {
  const selectId = useId();
  const past = useMemo(
    () =>
      [...(orders || [])].sort((a, b) => {
        const byDate = String(b.created_at || "").localeCompare(String(a.created_at || ""));
        return byDate !== 0 ? byDate : Number(b.id) - Number(a.id);
      }),
    [orders]
  );
  const [selectedId, setSelectedId] = useState("");
  const selected = past.find((o) => String(o.id) === selectedId) || null;
  const selectedItems = selected ? orderItems(selected) : [];

  useEffect(() => {
    if (!past.length) {
      setSelectedId("");
      return;
    }
    if (!selectedId || !past.some((o) => String(o.id) === selectedId)) {
      setSelectedId(String(past[0].id));
    }
  }, [past, selectedId]);

  if (!past.length) {
    return (
      <div className="order-panel__history">
        <div className="field">
          <label htmlFor={selectId}>Past orders</label>
          <select id={selectId} disabled>
            <option>No past orders yet</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="order-panel__history">
      <div className="field">
        <label htmlFor={selectId}>Past orders</label>
        <select
          id={selectId}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {past.map((o) => (
            <option key={o.id} value={o.id}>
              {optionLabel(o)}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <dl className="order-panel__past">
          <div>
            <dt>Reference</dt>
            <dd>{selected.ref}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatOrderDate(selected.created_at) || "—"}</dd>
          </div>
          {selected.fabric_id ? (
            <>
              <div>
                <dt>Product</dt>
                <dd>{productName(selected)}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>{quantityLabel(selected)}</dd>
              </div>
              {selected.color ? (
                <div>
                  <dt>Colour</dt>
                  <dd>{selected.color}</dd>
                </div>
              ) : null}
            </>
          ) : selectedItems.length > 1 ? (
            <div>
              <dt>Products</dt>
              <dd>
                <ul className="order-panel__lines">
                  {selectedItems.map((item, i) => (
                    <li key={`${item.garment || item.product_id}-${i}`}>{itemDetail(item)}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : (
            <>
              <div>
                <dt>Product</dt>
                <dd>{productName(selected)}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>
                  {`${selected.quantity} pcs${
                    formatSizeRun(selected.sizes) ? ` · ${formatSizeRun(selected.sizes)}` : ""
                  }`}
                </dd>
              </div>
              {selected.color ? (
                <div>
                  <dt>Colour</dt>
                  <dd>{selected.color}</dd>
                </div>
              ) : null}
              {selected.fabric && !selected.fabric_id ? (
                <div>
                  <dt>Fabric</dt>
                  <dd>{selected.fabric}</dd>
                </div>
              ) : null}
              {selected.height ? (
                <div>
                  <dt>Height</dt>
                  <dd>{selected.height}</dd>
                </div>
              ) : null}
            </>
          )}
          {selected.contact_name ? (
            <div>
              <dt>Name</dt>
              <dd>{selected.contact_name}</dd>
            </div>
          ) : null}
          <div>
            <dt>Stage</dt>
            <dd>{orderStageName(selected.stage)}</dd>
          </div>
          {selected.notes ? (
            <div>
              <dt>Notes</dt>
              <dd>{selected.notes}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}
