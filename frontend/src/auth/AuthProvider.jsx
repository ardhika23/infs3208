import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);
const BASE = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Pulihkan sesi dari localStorage saat reload
  useEffect(() => {
    const t = localStorage.getItem("access");
    if (t) {
      // (opsional) bisa fetch /api/auth/me/ kalau ada
      setUser({ username: localStorage.getItem("username") || "user" });
    }
  }, []);

  async function login(username, password) {
    const r = await fetch(`${BASE}/api/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) {
      let msg = "Invalid credentials";
      try { msg = (await r.json())?.detail || msg; } catch {}
      throw new Error(msg);
    }
    const { access, refresh } = await r.json();
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("username", username);
    setUser({ username });
  }

  async function logout() {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      // optional: blacklist refresh token di backend
      await fetch(`${BASE}/api/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ isAuthed: !!localStorage.getItem("access"), user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);