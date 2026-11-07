import { Icon } from '../components/Icon'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Tilt } from '../components/ui'
import { Avatar } from '../components/Avatar'

// Employer view: everyone who applied to my postings (admin sees all). RLS limits rows to my postings.
export default function Applications() {
  const [rows, setRows] = useState<any[]>([]); const [people, setPeople] = useState<any>({}); const [open, setOpen] = useState<string | null>(null)
  const load = async () => {
    const { data } = await supabase.from('applications').select('*, postings(title,company)').order('created_at', { ascending: false }); setRows(data || [])
    const ids = [...new Set((data || []).map((a: any) => a.applicant_user_id))]
    if (ids.length) setPeople(Object.fromEntries(((await supabase.from('applicants').select('*').in('user_id', ids)).data || []).map((p: any) => [p.user_id, p])))
  }
  useEffect(() => { load() }, [])
  const setStatus = async (id: string, status: string) => { await supabase.from('applications').update({ status }).eq('id', id); load() }
  return (<><h2>Applications received</h2>
    <div className="cards3">{rows.map(a => { const p = people[a.applicant_user_id] || {}; return <Tilt key={a.id}>
      <div className="row"><Avatar url={p.photo_url} style={p.photo_style} size={60} name={p.name} />
        <div><h3 style={{ margin: 0 }}>{p.name || 'Applicant'}</h3><p className="muted" style={{ margin: 0 }}>for <b>{a.postings?.title}</b></p></div></div>
      <span className={'badge ' + (a.status === 'applied' ? 'pending' : a.status === 'shortlisted' ? 'confirmed' : 'rejected')}>{a.status}</span>
      {a.message && <p>“{a.message}”</p>}<p className="muted">{p.degree} {p.graduation_year && `· ${p.graduation_year}`}</p>
      <div className="row"><button className="btn" onClick={() => setStatus(a.id, 'shortlisted')}><Icon name="star" />Shortlist</button>
        <button className="btn ghost" onClick={() => setStatus(a.id, 'rejected')}>Reject</button>
        <button className="btn ghost" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? 'Hide' : 'Profile'}</button></div>
      {open === a.id && <div className="detail"><p>{p.intro}</p><p><b>Why this job:</b> {p.why_job}</p><p><b>Achievements:</b> {p.achievements}</p><p><b>Dream career:</b> {p.dream_career}</p>
        <p><b>Contact:</b> {p.email} · {p.phone}</p></div>}</Tilt> })}
      {!rows.length && <p className="muted">No applications yet. They appear here when job seekers press Apply on your postings.</p>}</div></>)
}
