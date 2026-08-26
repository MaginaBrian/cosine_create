const TOKEN_KEY = "cc-token";
const USER_KEY = "cc-user";

let memoryToken = sessionStorage.getItem(TOKEN_KEY);

export function getToken() {
  return memoryToken || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  memoryToken = token || null;
  if (token && user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

export function clearSession() {
  setSession(null, null);
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function loginRequest(email, password) {
  return api("/api/auth/login", { method: "POST", body: { email, password } });
}

export function fetchMe() {
  return api("/api/me");
}

export function fetchProducts() {
  return api("/api/products");
}

export function fetchOrders() {
  return api("/api/orders");
}

export function createInquiry(payload) {
  return api("/api/inquiries", { method: "POST", body: payload });
}

export function fetchInquiries() {
  return api("/api/inquiries");
}

export function createOrder(payload) {
  return api("/api/orders", { method: "POST", body: payload });
}

export function updateOrderStage(orderId, stage) {
  return api(`/api/orders/${orderId}/stage`, { method: "PATCH", body: { stage } });
}

export async function deleteOrder(orderId) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE", headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText || "Could not delete order");
  }

  const blob = await res.blob();
  const header = res.headers.get("Content-Disposition") || "";
  const match = header.match(/filename="?([^"]+)"?/i);
  return { blob, filename: match?.[1] || `CC-${String(orderId).padStart(4, "0")}-completed.pdf` };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
