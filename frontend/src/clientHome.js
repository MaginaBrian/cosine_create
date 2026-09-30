export const STAFF_ROLES = ["admin", "produce", "dispatch"];

export function isStaffRole(user) {
  return STAFF_ROLES.includes(user?.role);
}

export function staffNavLabel(user) {
  if (user?.role === "produce") return "Production";
  if (user?.role === "dispatch") return "Dispatch";
  return "Admin";
}

export function clientHome(user) {
  if (!user) return "#/login";
  if (isStaffRole(user)) return "#/admin";
  if (user.role === "buyer") return "#/work/cosine-textiles";
  if (user.client_slug) return `#/work/${user.client_slug}`;
  return "#/";
}

export function isBrandOwner(user, slug) {
  return Boolean(user?.role === "client" && user.client_slug && user.client_slug === slug);
}

export function canOrderTextiles(user) {
  return user?.role === "buyer";
}

export function accountLabel(user) {
  if (user?.role === "client" && user.email) return user.email;
  return user?.brand || user?.name || "";
}
