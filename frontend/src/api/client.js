const BASE = import.meta.env.VITE_API_URL;

export async function api(path, { method="GET", body, auth=true, headers={} } = {}) {
  if (auth) {
    const t = localStorage.getItem("access");
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  if (res.status !== 401) return res;

  // 401 -> coba refresh
  const refresh = localStorage.getItem("refresh");
  if (!auth || !refresh) return res;

  const r2 = await fetch(`${BASE}/api/auth/refresh/`, {
    method: "POST", headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!r2.ok) return res;
  const { access } = await r2.json();
  localStorage.setItem("access", access);

  headers.Authorization = `Bearer ${access}`;
  return fetch(`${BASE}${path}`, { method, headers, body });
}