import { useEffect, useState } from "react";
const BASE = import.meta.env.VITE_API_URL;

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch(`${BASE}/api/results`);
    const data = await r.json();
    setRows([...data].sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)));
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div style={{maxWidth:1000, margin:"24px auto", padding:16}}>
      <h2>History</h2>
      <button onClick={load} disabled={loading}>{loading?"Refreshing...":"Refresh"}</button>
      <div style={{overflowX:"auto", marginTop:12}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{textAlign:"left", padding:8}}>Time</th>
              <th style={{textAlign:"left", padding:8}}>Filename</th>
              <th style={{textAlign:"left", padding:8}}>Objects</th>
              <th style={{textAlign:"left", padding:8}}>Avg Conf</th>
              <th style={{textAlign:"left", padding:8}}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} style={{borderTop:"1px solid #eee"}}>
                <td style={{padding:8}}>{new Date(r.created_at).toLocaleString()}</td>
                <td style={{padding:8, maxWidth:260, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{r.filename}</td>
                <td style={{padding:8}}>{r.total_objects ?? r.items?.length ?? 0}</td>
                <td style={{padding:8}}>{(r.avg_conf ?? 0).toFixed(3)}</td>
                <td style={{padding:8}}>
                  <img src={`${BASE}${r.annotated_url || r.file_url}`} alt="" style={{height:56, borderRadius:6}}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}