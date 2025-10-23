import { useEffect, useState } from "react";
import { getSummary } from "./api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load(d = days) {
    setLoading(true);
    try { setData(await getSummary(d)); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(days); }, [days]);

  if (!data) return <div style={{padding:16}}>{loading ? "Loading..." : "No data"}</div>;

  return (
    <div style={{maxWidth:1100, margin:"24px auto", padding:16}}>
      <div style={{display:"flex", gap:12, alignItems:"center"}}>
        <h2 style={{margin:0}}>Analytics</h2>
        <select value={days} onChange={e=>setDays(Number(e.target.value))}>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
        </select>
        <button onClick={()=>load(days)} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button>
      </div>

      {/* Headline cards */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:12}}>
        <Card title="Total Images" value={data.total_images} />
        <Card title="Total Objects" value={data.total_objects} />
        <Card title="Avg Confidence" value={data.avg_conf.toFixed(3)} />
      </div>

      {/* Line: images per day */}
      <Section title="Detections per Day">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={24}/>
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="images" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      {/* Line: avg confidence per day */}
      <Section title="Average Confidence per Day">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={24}/>
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Line type="monotone" dataKey="avg_conf" stroke="#82ca9d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      {/* Bar: count per class */}
      <Section title="Objects by Class">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_class}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="klass" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Latest table */}
      <Section title="Latest Results">
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <Th>Time</Th><Th>Filename</Th><Th>Objects</Th><Th>Avg Conf</Th><Th>Preview</Th>
              </tr>
            </thead>
            <tbody>
              {data.latest.map(r=>(
                <tr key={r.id} style={{borderTop:"1px solid #eee"}}>
                  <Td>{new Date(r.created_at).toLocaleString()}</Td>
                  <Td title={r.filename} style={{maxWidth:260, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{r.filename}</Td>
                  <Td>{r.total_objects}</Td>
                  <Td>{r.avg_conf.toFixed(3)}</Td>
                  <Td><img src={`${import.meta.env.VITE_API_URL}${r.annotated_url || r.file_url}`} style={{height:56, borderRadius:6}}/></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{padding:"12px 16px", border:"1px solid #eee", borderRadius:10}}>
      <div style={{opacity:.7, fontSize:13}}>{title}</div>
      <div style={{fontSize:24, fontWeight:700}}>{value}</div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div style={{marginTop:24}}>
      <h3 style={{margin:"6px 0 12px 0"}}>{title}</h3>
      {children}
    </div>
  );
}
function Th({children}) { return <th style={{textAlign:"left", fontWeight:700, padding:"8px"}}>{children}</th>; }
function Td({children, ...p}) { return <td {...p} style={{padding:"8px"}}>{children}</td>; }