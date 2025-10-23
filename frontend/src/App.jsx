import { useState, useEffect, useMemo } from "react";
import { uploadFile, runDetect, listResults, getSummary } from "./api";
const BASE = import.meta.env.VITE_API_URL;

export default function App() {
  const [tab, setTab] = useState("detect");

  // ========= Detect =========
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);

  async function onDetect() {
    if (!file) return;
    setLoadingDet(true);
    try {
      const up = await uploadFile(file);
      const det = await runDetect(up.file_id);
      setResult(det);
    } catch (e) {
      alert(e.message || "Detect failed");
    } finally {
      setLoadingDet(false);
    }
  }

  // ========= History =========
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  async function loadHistory() {
    setLoading(true);
    try {
      const data = await listResults();
      setRows(
        [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { if (tab === "history") loadHistory(); }, [tab]);

  // ========= Analytics =========
  const [days, setDays] = useState(7);
  const [ana, setAna] = useState(null);
  const [loadingAna, setLoadingAna] = useState(false);

  async function loadAnalytics(d = days) {
    setLoadingAna(true);
    try {
      const data = await getSummary(d);
      setAna(data);
    } catch (e) {
      alert(e.message || "Load analytics failed");
    } finally {
      setLoadingAna(false);
    }
  }
  useEffect(() => { if (tab === "analytics") loadAnalytics(); }, [tab]);

  // inject CSS sekali (tema gelap + glass cards)
  useEffect(() => {
    const id = "ptm-ui";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = CSS;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="ptm-root">
      {/* Header (user / logout ada di Gate kamu; ini hanya spacer & border) */}
      <div className="ptm-header-spacer" />

      <div className="ptm-container">
        {/* Tabs */}
        <div className="ptm-tabs">
          <button className={`ptm-tab ${tab === "detect" ? "active" : ""}`} onClick={() => setTab("detect")}>Detect</button>
          <button className={`ptm-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>History</button>
          <button className={`ptm-tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>
        </div>

        {/* ===== Detect ===== */}
        {tab === "detect" && (
          <>
            <h1 className="ptm-title">Detection</h1>

            <div className="ptm-card">
              <div className="ptm-upload-row">
                <label className="ptm-file">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <span>Choose File</span>
                </label>

                <span className="ptm-file-name">{file?.name || "No file chosen"}</span>

                <button className="ptm-btn-grad" onClick={onDetect} disabled={!file || loadingDet}>
                  {loadingDet ? "Detecting..." : "DETECT"}
                </button>
              </div>

              <div className="ptm-result">
                {result ? (
                  <img
                    className="ptm-result-img"
                    src={`${BASE}${result.annotated_url || result.file_url}?t=${Date.now()}`}
                    alt=""
                  />
                ) : (
                  <p className="ptm-placeholder">Upload an image to detect objects</p>
                )}
              </div>

              {result && (
                <div className="ptm-model-info">
                  <strong>Model Version:</strong> {result.model_version} &nbsp;|&nbsp; <strong>Pod ID:</strong> {result.pod_id}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== History ===== */}
        {tab === "history" && (
          <>
            <h1 className="ptm-title">History</h1>

            <div className="ptm-card">
              <div className="ptm-row-between">
                <div>
                  <button className="ptm-btn" onClick={loadHistory} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <span className="ptm-total">Total: {rows.length}</span>
                </div>
              </div>

              <div className="ptm-table-wrap">
                <table className="ptm-table">
                  <thead>
                    <tr>
                      <Th>Time</Th>
                      <Th>Filename</Th>
                      <Th>Objects</Th>
                      <Th>Avg Conf</Th>
                      <Th>Model</Th>
                      <Th>Pod</Th>
                      <Th>Preview</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <Td>{new Date(r.created_at).toLocaleString()}</Td>
                        <Td className="ptm-ellipsis" title={r.filename}>{r.filename}</Td>
                        <Td>{r.total_objects ?? r.items?.length ?? 0}</Td>
                        <Td>{(r.avg_conf ?? 0).toFixed(3)}</Td>
                        <Td>{r.model_version}</Td>
                        <Td className="ptm-mono">{r.pod_id}</Td>
                        <Td>
                          <img
                            src={`${BASE}${r.annotated_url || r.file_url}`}
                            alt=""
                            className="ptm-thumb"
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== Analytics ===== */}
        {tab === "analytics" && (
          <>
            <h1 className="ptm-title">Analytics</h1>

            <div className="ptm-range">
              <label>Range (days):</label>
              <select
                value={days}
                onChange={(e) => {
                  const d = Number(e.target.value);
                  setDays(d);
                  loadAnalytics(d);         // langsung fetch → per-day selalu update
                }}
              >
                {[7, 14, 30, 60, 90].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button className="ptm-btn" onClick={() => loadAnalytics(days)} disabled={loadingAna}>
                {loadingAna ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {ana && (
              <>
                <div className="ptm-kpi-grid">
                  <Kpi title="Total Images" value={ana.total_images} />
                  <Kpi title="Total Objects" value={ana.total_objects} />
                  <Kpi title="Avg Confidence" value={Number(ana.avg_conf).toFixed(3)} />
                </div>

                <div className="ptm-card">
                  <div className="ptm-chart-title">Per-day (images & avg_conf)</div>
                  <PerDayCombo series={ana.series} />
                </div>

                <div className="ptm-card">
                  <div className="ptm-chart-title">Top Classes</div>
                  <TopClassesBars data={ana.by_class} />
                </div>

                <div className="ptm-latest">
                  <div className="ptm-chart-title">Latest Detections</div>
                  {(ana.latest || []).map((r) => (
                    <div className="ptm-latest-item" key={r.id}>
                      <img className="ptm-latest-thumb" src={`${BASE}${r.annotated_url || r.file_url}`} alt="" />
                      <div className="ptm-latest-info">
                        <div className="ptm-latest-date">{new Date(r.created_at).toLocaleString()}</div>
                        <div className="ptm-latest-file">{r.filename}</div>
                        <div className="ptm-latest-meta">objects: {r.total_objects} • avg_conf: {(r.avg_conf ?? 0).toFixed(3)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- table cells ---------- */
function Th({ children }) { return <th className="ptm-th">{children}</th>; }
function Td({ children, ...p }) { return <td {...p} className="ptm-td">{children}</td>; }

/* ---------- small components ---------- */
function Kpi({ title, value }) {
  return (
    <div className="ptm-stat">
      <div className="ptm-stat-label">{title}</div>
      <div className="ptm-stat-value">{value}</div>
    </div>
  );
}

/** SVG combo chart: bar(images) + line(avg_conf) */
function PerDayCombo({ series }) {
  const data = useMemo(
    () => (series || []).map(d => ({
      date: new Date(d.date), images: Number(d.images || 0), conf: Number(d.avg_conf || 0),
    })), [series]
  );
  if (!data.length) return <small style={{opacity:.7}}>No data</small>;

  const W = 980, H = 260, P = {l:50,r:50,t:24,b:42};
  const maxImg = Math.max(...data.map(d => d.images), 1);
  const step = (W - P.l - P.r) / data.length;
  const barW = Math.max(6, Math.min(32, step * 0.65));
  const x = i => P.l + i * step + step/2;
  const yImg = v => P.t + (1 - v/maxImg) * (H - P.t - P.b);
  const yConf = c => P.t + (1 - c) * (H - P.t - P.b);

  const path = data.map((d,i)=>`${i?'L':'M'}${x(i)} ${yConf(d.conf)}`).join(" ");

  return (
    <div style={{overflowX:"auto"}}>
      <svg width={W} height={H} style={{maxWidth:"100%"}}>
        <defs>
          <linearGradient id="barGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#007bff"/>
          </linearGradient>
        </defs>

        <line x1={P.l} y1={H-P.b} x2={W-P.r} y2={H-P.b} stroke="rgba(255,255,255,.15)"/>
        <line x1={P.l} y1={P.t} x2={P.l} y2={H-P.b} stroke="rgba(255,255,255,.12)"/>

        {data.map((d,i)=>(
          <rect key={i}
            x={x(i)-barW/2} y={yImg(d.images)}
            width={barW} height={Math.max(1, H-P.b-yImg(d.images))}
            rx="4" fill="url(#barGrad)" opacity=".9"/>
        ))}

        <path d={path} fill="none" stroke="#00ffe6" strokeWidth="2.2" opacity=".9"/>
        {data.map((d,i)=>(<circle key={`c${i}`} cx={x(i)} cy={yConf(d.conf)} r="3.5" fill="#00ffe6"/>))}

        {[0,.25,.5,.75,1].map(t=>{
          const v = Math.round(t*maxImg), yy = yImg(v);
          return (
            <g key={t}>
              <text x={P.l-8} y={yy+4} fontSize="11" fill="rgba(255,255,255,.6)" textAnchor="end">{v}</text>
            </g>
          );
        })}
        {[0,.25,.5,.75,1].map(c=>{
          const yy = yConf(c);
          return (
            <g key={`r${c}`}>
              <text x={W-P.r+8} y={yy+4} fontSize="11" fill="rgba(255,255,255,.6)">{c.toFixed(2)}</text>
            </g>
          );
        })}

        {data.map((d,i)=>(
          <text key={`x${i}`} x={x(i)} y={H-P.b+18} fontSize="11" fill="rgba(255,255,255,.65)" textAnchor="middle">
            {d.date.toLocaleDateString()}
          </text>
        ))}
      </svg>
    </div>
  );
}

function TopClassesBars({ data }) {
  const items = useMemo(() => {
    const arr = [...(data||[])];
    if (!arr.length) return [];
    const top = arr.slice(0,5);
    const other = arr.slice(5).reduce((s,r)=>s+(r.count||0),0);
    if (other>0) top.push({klass:"Other", count:other});
    return top;
  }, [data]);

  if (!items.length) return <small style={{opacity:.7}}>No data</small>;
  const max = Math.max(...items.map(d=>d.count), 1);

  return (
    <div className="ptm-top-classes">
      {items.map(r=>(
        <div className="ptm-class-row" key={r.klass}>
          <div className="ptm-class-name">{r.klass}</div>
          <div className="ptm-class-bar">
            <div className="ptm-class-fill" style={{width:`${(r.count/max)*100}%`}} />
          </div>
          <div className="ptm-class-count">{r.count}</div>
        </div>
      ))}
    </div>
  );
}

/* ===================== CSS (di-inject) ===================== */
const CSS = `
  :root { --bg:#0f2027; --bg2:#203a43; --bg3:#2c5364; --glass: rgba(255,255,255,.06); }
  .ptm-root{
    min-height:100vh; color:#fff;
    background: linear-gradient(135deg, var(--bg) 0%, var(--bg2) 50%, var(--bg3) 100%);
    font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .ptm-header-spacer{ height:56px; border-bottom:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); backdrop-filter:blur(8px); }
  .ptm-container{ max-width:1100px; margin:0 auto; padding:24px 16px 40px; }

  .ptm-tabs{ display:flex; gap:12px; margin-bottom:26px; }
  .ptm-tab{
    padding:12px 22px; border-radius:10px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
    color:rgba(255,255,255,.75); font-weight:700; letter-spacing:.3px; text-transform:uppercase;
    transition:.2s;
  }
  .ptm-tab:hover{ background:rgba(255,255,255,.12); color:#fff; }
  .ptm-tab.active{ background:linear-gradient(135deg, #ec1c24 0%, #007bff 100%); border-color:transparent; color:#fff; }

  .ptm-title{ font-size:36px; font-weight:800; letter-spacing:-.5px; margin-bottom:22px; }

  .ptm-card{
    background:rgba(255,255,255,.05); backdrop-filter:blur(18px);
    border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:26px; margin-bottom:24px;
  }

  .ptm-upload-row{ display:flex; gap:16px; align-items:center; margin-bottom:18px; flex-wrap:wrap; }
  .ptm-file{ position:relative; overflow:hidden; display:inline-block; }
  .ptm-file input{ position:absolute; left:-9999px; }
  .ptm-file span{
    padding:12px 20px; border-radius:10px; border:2px solid rgba(255,255,255,.25);
    background:rgba(255,255,255,.08); color:#fff; font-weight:700;
  }
  .ptm-file-name{ opacity:.8; font-size:14px; }
  .ptm-btn-grad{
    padding:12px 28px; border:none; border-radius:10px; color:#fff; font-weight:800; letter-spacing:.4px;
    background:linear-gradient(135deg, #ec1c24 0%, #007bff 100%);
    box-shadow:0 8px 20px rgba(236, 28, 36, .28);
  }
  .ptm-btn{ padding:10px 20px; border-radius:8px; color:#fff; background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.18); }
  .ptm-total{ margin-left:14px; opacity:.7; }

  .ptm-result{ background:rgba(0,0,0,.28); border:1px solid rgba(255,255,255,.12); border-radius:12px; min-height:360px;
    display:flex; align-items:center; justify-content:center; padding:20px; }
  .ptm-result-img{ max-width:100%; border-radius:8px; }
  .ptm-placeholder{ color:rgba(255,255,255,.5); }

  .ptm-model-info{ margin-top:14px; padding:12px; background:rgba(0,0,0,.22); border-radius:8px; font-size:13px; opacity:.9; }

  .ptm-row-between{ display:flex; justify-content:space-between; align-items:center; }
  .ptm-table-wrap{ overflow-x:auto; }
  .ptm-table{ width:100%; border-collapse:collapse; }
  .ptm-th{ padding:14px 12px; text-align:left; font-size:12px; letter-spacing:.4px; text-transform:uppercase; color:rgba(255,255,255,.7); border-bottom:2px solid rgba(255,255,255,.12); }
  .ptm-td{ padding:14px 12px; border-bottom:1px solid rgba(255,255,255,.08); font-size:14px; }
  .ptm-ellipsis{ max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ptm-mono{ font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  .ptm-thumb{ width:60px; height:60px; object-fit:cover; border-radius:8px; border:2px solid rgba(255,255,255,.1); }
  .ptm-table tr:hover{ background:rgba(255,255,255,.03); }

  .ptm-range{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .ptm-range select{ padding:8px 14px; border-radius:8px; color:#fff; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); }

  .ptm-kpi-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:20px; margin-bottom:20px; }
  .ptm-stat{ background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:26px; }
  .ptm-stat-label{ font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:rgba(255,255,255,.7); margin-bottom:8px; }
  .ptm-stat-value{ font-size:42px; font-weight:800; }

  .ptm-chart-title{ font-weight:700; margin-bottom:12px; opacity:.95; }

  .ptm-top-classes{ display:grid; gap:12px; max-width:560px; }
  .ptm-class-row{ display:grid; grid-template-columns:160px 1fr 60px; align-items:center; gap:12px; }
  .ptm-class-name{ opacity:.9; }
  .ptm-class-bar{ height:12px; background:rgba(255,255,255,.08); border-radius:6px; overflow:hidden; }
  .ptm-class-fill{ height:100%; background:linear-gradient(90deg,#00d4ff,#0099cc); }

  .ptm-latest{ margin-top:20px; }
  .ptm-latest-item{ display:flex; gap:14px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:12px; margin-bottom:12px; }
  .ptm-latest-thumb{ width:80px; height:80px; object-fit:cover; border-radius:10px; border:2px solid rgba(255,255,255,.12); }
  .ptm-latest-date{ font-weight:700; }
  .ptm-latest-file{ opacity:.8; font-size:12px; margin:2px 0; }
  .ptm-latest-meta{ opacity:.8; font-size:12px; }
`;