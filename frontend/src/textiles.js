export const KIND_ORDER = [
  "T-SHIRT",
  "FLEECE",
  "LINEN",
  "SPORTS/POLO",
  "WORKOUT TEE",
  "LEGGING",
  "WOOL",
  "SPORTS/ JACKET",
  "OUTDOOR JACKET",
];

export const KIND_LABELS = {
  "T-SHIRT": "T-shirt",
  FLEECE: "Fleece",
  LINEN: "Linen",
  "SPORTS/POLO": "Sports / polo",
  "WORKOUT TEE": "Workout tee",
  LEGGING: "Legging",
  WOOL: "Wool",
  "SPORTS/ JACKET": "Sports / jacket",
  "OUTDOOR JACKET": "Outdoor jacket",
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] || kind;
}

export function formatGsm(gsm) {
  return gsm == null ? "GSM —" : `${gsm} GSM`;
}

export function formatMoney(value, currency) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  const digits = Number.isInteger(number) ? 0 : 2;
  const amount = number.toLocaleString("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  });
  if (currency === "CNY") return `CNY ${amount}`;
  if (currency === "KES") return `KES ${amount}`;
  return amount;
}

export function lineSummary(fabric) {
  if (!fabric) return "Fabric";
  const bits = [kindLabel(fabric.kind), fabric.composition];
  if (fabric.gsm != null) bits.push(`${fabric.gsm} GSM`);
  return bits.filter(Boolean).join(" · ");
}

export function quantityLabel(order) {
  const qty = order?.quantity ?? 0;
  if (order?.unit === "kg") return `${qty} kg`;
  if (order?.unit === "m" || order?.fabric_line || order?.fabric_id) return `${qty} m`;
  return `${qty} pcs`;
}

export function groupFabrics(fabrics) {
  const groups = new Map();
  for (const fabric of fabrics) {
    if (!groups.has(fabric.kind)) groups.set(fabric.kind, []);
    groups.get(fabric.kind).push(fabric);
  }
  const ordered = KIND_ORDER.filter((kind) => groups.has(kind)).map((kind) => ({
    kind,
    label: kindLabel(kind),
    fabrics: groups.get(kind),
  }));
  for (const [kind, rows] of groups) {
    if (!KIND_ORDER.includes(kind)) {
      ordered.push({ kind, label: kindLabel(kind), fabrics: rows });
    }
  }
  return ordered;
}
