// src/auth/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setErr("");
    try {
      setLoading(true);
      await login(u.trim(), p);
      // berhasil -> AuthProvider akan redirect render App
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="login-card">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-text">P</span>
            </div>
            <h1>Secure Console</h1>
            <div className="divider" />
            <p className="subtitle">Sign in to continue</p>
          </div>

          {err && (
            <div className="alert" role="alert">
              <strong>Error:&nbsp;</strong>{err}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={u}
                onChange={(e) => setU(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={p}
                onChange={(e) => setP(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "PROCESSING..." : "LOGIN"}
            </button>

            <div className="footer-text">
              PRIVATE ACCESS ONLY • © {new Date().getFullYear()}
            </div>
          </form>
        </div>
      </div>

      {/* ====== styles ====== */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        /* Elegant floating orbs */
        .page::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(236, 28, 36, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          top: -300px; right: -200px;
          animation: float 20s ease-in-out infinite;
        }
        .page::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0, 123, 255, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -250px; left: -150px;
          animation: float 15s ease-in-out infinite reverse;
        }
        @keyframes float {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(30px,30px) scale(1.1); }
        }

        .container { position: relative; z-index: 1; width: 100%; max-width: 480px; padding: 20px; }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 56px 48px;
          box-shadow: 0 24px 48px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
        }
        .logo-container { text-align: center; margin-bottom: 32px; }
        .logo {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #ec1c24 0%, #c41e3a 50%, #007bff 100%);
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 20px; position: relative;
          box-shadow: 0 12px 24px rgba(236, 28, 36, 0.25);
        }
        .logo::after {
          content: ''; position: absolute; inset: 0; border-radius: 20px; padding: 2px;
          background: linear-gradient(135deg, rgba(255,255,255,.4), rgba(255,255,255,.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
        }
        .logo-text { font-size: 36px; font-weight: 700; color: #fff; letter-spacing: -1px; }
        h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; letter-spacing: -0.5px; }
        .subtitle { color: #737373; font-size: 15px; letter-spacing: .2px; }

        .alert {
          margin: 18px 0 6px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
        }

        .form-group { margin: 20px 0 24px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #404040; margin-bottom: 10px; letter-spacing: .3px; text-transform: uppercase; }
        input[type="text"], input[type="password"] {
          width: 100%; padding: 16px 18px; font-size: 15px;
          border: 2px solid #e5e5e5; border-radius: 12px;
          transition: all .3s cubic-bezier(.4,0,.2,1);
          background: #fafafa; color: #1a1a1a;
        }
        input:hover { border-color: #d4d4d4; background: #fff; }
        input:focus {
          outline: none; border-color: #ec1c24; background: #fff;
          box-shadow: 0 0 0 4px rgba(236, 28, 36, 0.08);
        }
        input::placeholder { color: #a3a3a3; }

        .login-button {
          width: 100%; padding: 16px; margin-top: 12px;
          border: none; border-radius: 12px; color: #fff;
          background: linear-gradient(135deg, #ec1c24 0%, #c41e3a 50%, #007bff 100%);
          font-size: 15px; font-weight: 600; letter-spacing: .5px;
          cursor: pointer; position: relative; overflow: hidden;
          transition: all .3s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 8px 16px rgba(236, 28, 36, 0.25);
        }
        .login-button::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,.2), transparent);
          transform: translateX(-100%); transition: transform .6s;
        }
        .login-button:hover::before { transform: translateX(100%); }
        .login-button:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(236,28,36,.35); }
        .login-button:active { transform: translateY(0); }
        .login-button[disabled] { opacity: .8; cursor: not-allowed; }

        .footer-text { text-align: center; margin-top: 32px; color: #a3a3a3; font-size: 12px; font-weight: 500; letter-spacing: .5px; }
        .divider { width: 60px; height: 4px; background: linear-gradient(90deg, #ec1c24, #007bff); margin: 0 auto 24px; border-radius: 2px; opacity: .3; }

        @media (max-width: 480px) {
          .login-card { padding: 48px 36px; }
          h1 { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}