import { Icon } from '../components/Icon'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Tilt } from '../components/ui'
import { Avatar } from '../components/Avatar'

export default function Applicants() {
  const { session } = useAuth()
  const [rows, setRows] = useState<any[]>([]); const [acts, setActs] = useState<any[]>([]); const [q, setQ] = useState(''); const [open, setOpen] = useState<string | null>(null); const [savedOnly, setSavedOnly] = useState(false)
  const loadActs = async () => setActs((await supabase.from('employer_actions').select('*').eq('employer_id', session.user.id)).data || [])
  useEffect(() => { supabase.from('applicants').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || [])); loadActs() }, [])
  const has = (uid: string, kind: string) => acts.some(a => a.applicant_user_id === uid && a.kind === kind)
  // toggle Save (private bookmark) or Interested (the applicant gets notified)
  const toggle = async (uid: string, kind: string) => {
    if (has(uid, kind)) await supabase.from('employer_actions').delete().eq('employer_id', session.user.id).eq('applicant_user_id', uid).eq('kind', kind)
    else await supabase.from('employer_actions').insert({ employer_id: session.user.id, applicant_user_id: uid, kind })
    loadActs()
  }
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()) && (!savedOnly || has(r.user_id, 'saved')))
  return (<><h2>Applicants</h2>
    <div className="row"><input className="search" style={{ flex: 1 }} placeholder="Search name, degree, achievements…" value={q} onChange={e => setQ(e.target.value)} />
      <label className="chk"><input type="checkbox" checked={savedOnly} onChange={e => setSavedOnly(e.target.checked)} /> Saved only</label></div>
    <div className="cards3">{shown.map(r => <Tilt key={r.id}>
      <div className="row"><Avatar url={r.photo_url} style={r.photo_style} size={64} name={r.name} /><div><h3 style={{ margin: 0 }}>{r.name}</h3>
        <p className="muted" style={{ margin: 0 }}>{r.degree} {r.graduation_year && `· ${r.graduation_year}`} {r.age && `· Age ${r.age}`}</p></div></div>
      <p>{r.intro}</p>
      <div className="row"><button className={has(r.user_id, 'saved') ? 'btn' : 'btn ghost'} onClick={() => toggle(r.user_id, 'saved')}><Icon name="star" fill={has(r.user_id, 'saved')} />{has(r.user_id, 'saved') ? 'Saved' : 'Save'}</button>
        <button className={has(r.user_id, 'interested') ? 'btn' : 'btn ghost'} onClick={() => toggle(r.user_id, 'interested')}><Icon name="thumbs-up" />{has(r.user_id, 'interested') ? 'Interested' : 'I\'m interested'}</button>
        <button className="btn ghost" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Hide' : 'Full profile'}</button></div>
      {open === r.id && <div className="detail"><p><b>Why this job:</b> {r.why_job}</p><p><b>Achievements:</b> {r.achievements}</p><p><b>Dream career:</b> {r.dream_career}</p>
        <p><b>Contact:</b> {r.email} · {r.phone}</p><p><b>Social:</b> IG {r.instagram} · FB {r.facebook} · Snap {r.snapchat}</p></div>}</Tilt>)}
      {!shown.length && <p className="muted">No applicants found.</p>}</div></>)
}
