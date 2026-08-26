export function clientHome(user) {
  if (!user) return "#/login";
  if (user.role === "admin") return "#/admin";
  if (user.client_slug) return `#/work/${user.client_slug}`;
  return "#/";
}

export function isBrandOwner(user, slug) {
  return Boolean(user?.role === "client" && user.client_slug && user.client_slug === slug);
}
