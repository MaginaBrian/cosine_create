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

export function createOrder(payload) {
  return api("/api/orders", { method: "POST", body: payload });
}
