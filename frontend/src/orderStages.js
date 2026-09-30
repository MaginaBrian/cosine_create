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

export function canMoveOrderStage(role, from, to) {
  const a = orderStage(from);
  const b = orderStage(to);
  if (a === b) return true;
  if (role === "admin") return true;
  if (role === "produce") return a === "processing" && b === "produce";
  if (role === "dispatch") return a === "produce" && b === "distribute";
  return false;
}

export function stageChoices(role, current) {
  const now = orderStage(current);
  if (role === "admin") return ORDER_STAGES;
  return ORDER_STAGES.filter((s) => s.key === now || canMoveOrderStage(role, now, s.key));
}

export function rowStageClass(stage) {
  const key = orderStage(stage);
  if (key === "produce") return "admin-row--produce";
  if (key === "distribute") return "admin-row--dispatch";
  return "";
}
