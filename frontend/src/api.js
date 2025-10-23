// src/api.js
const BASE = import.meta.env.VITE_API_URL; // ex: http://localhost:8000

async function request(path, { method = "GET", headers = {}, body, auth = true } = {}) {
  if (auth) {
    const t = localStorage.getItem("access");
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  if (res.status !== 401 || !auth) return res;

  // 401 -> refresh
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return res;

  const rr = await fetch(`${BASE}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!rr.ok) return res;

  const { access } = await rr.json();
  localStorage.setItem("access", access);

  headers.Authorization = `Bearer ${access}`;
  return fetch(`${BASE}${path}`, { method, headers, body: payload });
}

function ensureOk(r) {
  if (r.ok) return r;
  return r.text().then((t) => {
    try { const j = JSON.parse(t); throw new Error(j.detail || t); }
    catch { throw new Error(t); }
  });
}

// ==== Detect APIs ====
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await request(`/api/detect/upload`, { method: "POST", body: fd });
  await ensureOk(r);
  return r.json();
}

export async function runDetect(file_id) {
  const r = await request(`/api/detect/detect`, {
    method: "POST",
    body: { file_id },
  });
  await ensureOk(r);
  return r.json();
}

export async function listResults() {
  const r = await request(`/api/detect/results`);
  await ensureOk(r);
  return r.json();
}

export async function getSummary(days = 7) {
  const r = await request(`/api/detect/summary?days=${days}`);
  await ensureOk(r);
  return r.json();
}

// ==== Auth ====
export async function loginApi(username, password) {
  const r = await fetch(`${BASE}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ username, password }),
  });
  await ensureOk(r);
  return r.json();
}

export async function logoutApi() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}