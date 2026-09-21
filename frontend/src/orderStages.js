export const ORDER_STAGES = [
  { key: "processing", name: "Processing" },
  { key: "produce", name: "Production" },
  { key: "distribute", name: "Dispatch" },
];

export function orderStage(key) {
  const k = (key || "").trim();
  if (k === "distribute" || k === "dispatch") return "distribute";
  if (k === "produce" || k === "production") return "produce";
  return "processing";
}

export function orderStageName(key) {
  const found = ORDER_STAGES.find((s) => s.key === orderStage(key));
  return found?.name || "Processing";
}
