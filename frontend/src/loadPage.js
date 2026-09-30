export const loadAbout = () => import("./pages/About");
export const loadPeople = () => import("./pages/People");
export const loadAwards = () => import("./pages/Awards");
export const loadServices = () => import("./pages/Services");
export const loadProcess = () => import("./pages/Process");
export const loadWork = () => import("./pages/Work");
export const loadProject = () => import("./pages/Project");
export const loadLookbook = () => import("./pages/Lookbook");
export const loadTextileKind = () => import("./pages/TextileKind");
export const loadStart = () => import("./pages/Start");
export const loadLogin = () => import("./pages/Login");
export const loadStudio = () => import("./pages/Studio");
export const loadAdmin = () => import("./pages/Admin");

export function prefetchPath(path) {
  const hash = String(path || "").replace(/^#/, "") || "/";
  const withSlash = hash.startsWith("/") ? hash : `/${hash}`;
  const base = withSlash.split("?")[0];
  const parts = base.split("/").filter(Boolean);

  if (base === "/") {
    return;
  }
  if (base === "/about") {
    loadAbout();
    return;
  }
  if (base === "/people") {
    loadPeople();
    return;
  }
  if (base === "/awards") {
    loadAwards();
    return;
  }
  if (base === "/services") {
    loadServices();
    return;
  }
  if (base === "/process") {
    loadProcess();
    return;
  }
  if (base === "/work") {
    loadWork();
    return;
  }
  if (base === "/start") {
    loadStart();
    return;
  }
  if (base === "/portal" || base === "/login") {
    loadLogin();
    return;
  }
  if (base === "/studio" || base === "/account") {
    loadStudio();
    return;
  }
  if (base === "/admin") {
    loadAdmin();
    return;
  }
  if (parts[0] !== "work" || !parts[1]) return;

  loadProject();
  if (parts[1] === "cosine-textiles" && parts[2]) {
    loadTextileKind();
    return;
  }
  if (parts.length >= 3) loadLookbook();
}
