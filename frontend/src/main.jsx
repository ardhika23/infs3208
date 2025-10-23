import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App.jsx";
import { AuthProvider, useAuth } from "./auth/AuthProvider.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import "./global.css";

const theme = createTheme({
  primaryColor: "cyan",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  defaultRadius: "md",
  headings: { fontWeight: 700 },
});

function Gate() {
  const { isAuthed, logout, user } = useAuth();
  if (!isAuthed) return <LoginPage />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 8 }}>
        <span style={{ opacity: 0.6 }}>Hi, {user?.username || "user"}</span>
        <button onClick={logout}>Logout</button>
      </div>
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme} defaultColorScheme="light">
    <Notifications position="top-right" />
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </MantineProvider>
);