import { GARMENTS, formatSizeRun } from "./measurements";

export function orderItems(order) {
  if (order?.items?.length) return order.items;
  if (!order || order.fabric_id || order.fabric_line) return [];
  return [
    {
      product_id: order.product?.id,
      product_name: order.product?.name,
      garment: order.garment,
      quantity: order.quantity,
      sizes: order.sizes,
      color: order.color,
      height: order.height,
      fabric: order.fabric,
    },
  ];
}

export function itemName(item) {
  return (
    GARMENTS.find((g) => g.id === item?.garment)?.name ||
    item?.product_name ||
    item?.product?.name ||
    "Item"
  );
}

export function itemsLabel(order) {
  const items = orderItems(order);
  if (!items.length) return "";
  return [...new Set(items.map(itemName))].join(", ");
}

export function itemDetail(item) {
  return [
    itemName(item),
    item.color,
    item.height,
    formatSizeRun(item.sizes),
    item.quantity ? `${item.quantity} pcs` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
