import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Tilt } from '../components/ui'
import { Avatar } from '../components/Avatar'
export default function Applicants() {
  const [rows, setRows] = useState<any[]>([]); const [q, setQ] = useState(''); const [open, setOpen] = useState<string | null>(null)
  useEffect(() => { supabase.from('applicants').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || [])) }, [])
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
  return (<><h2>Applicants</h2><input className="search" placeholder="Search name, degree, achievements…" value={q} onChange={e => setQ(e.target.value)} />
    <div className="cards3">{shown.map(r => <Tilt key={r.id}>
      <div className="row"><Avatar url={r.photo_url} style={r.photo_style} size={64} name={r.name} /><div><h3 style={{ margin: 0 }}>{r.name}</h3>
        <p className="muted" style={{ margin: 0 }}>{r.degree} {r.graduation_year && `· ${r.graduation_year}`} {r.age && `· Age ${r.age}`}</p></div></div>
      <p>{r.intro}</p>
      <button className="btn ghost" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Hide' : 'Full profile'}</button>
      {open === r.id && <div className="detail"><p><b>Why this job:</b> {r.why_job}</p><p><b>Achievements:</b> {r.achievements}</p><p><b>Dream career:</b> {r.dream_career}</p>
        <p><b>Contact:</b> {r.email} · {r.phone}</p><p><b>Social:</b> IG {r.instagram} · FB {r.facebook} · Snap {r.snapchat}</p></div>}</Tilt>)}
      {!shown.length && <p className="muted">No applicants yet.</p>}</div></>)
}
