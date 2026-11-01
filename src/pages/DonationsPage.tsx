import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { requestFields } from '../lib/fields'
import { FieldsForm } from '../components/ui'

const blank = { currency: 'USD' }
export const Progress = ({ total, goal }: { total: number; goal: number }) =>
  <div className="bar"><div style={{ width: Math.min(100, (total / goal) * 100) + '%' }} /></div>

// Donations page: signed-in users ask for donations and manage the pledges people send them.
export default function DonationsPage({ cat }: { cat: any }) {
  const { session, signInWithGoogle } = useAuth()
  const [mine, setMine] = useState<any[]>([]); const [pledges, setPledges] = useState<any[]>([]); const [v, setV] = useState<any>(blank); const [msg, setMsg] = useState('')
  const load = async () => {
    if (!session) return
    const { data } = await supabase.from('donation_requests').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }); setMine(data || [])
    if (data?.length) setPledges((await supabase.from('fundings').select('*').in('request_id', data.map((r: any) => r.id)).order('created_at', { ascending: false })).data || [])
  }
  useEffect(() => { load() }, [session?.user.id])
  const submit = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('donation_requests').insert({ ...v, title: v.reason, user_id: session.user.id, status: 'pending' })
    setMsg(error ? error.message : 'Submitted ✓ — it goes live after admin approval.'); if (!error) { setV(blank); load() }
  }
  const setStatus = async (table: string, id: string, status: string) => { await supabase.from(table).update({ status }).eq('id', id); load() }
  const del = async (id: string) => { if (confirm('Delete this request?')) { await supabase.from('donation_requests').delete().eq('id', id); load() } }
  const total = (id: string) => pledges.filter(p => p.request_id === id && p.status === 'confirmed').reduce((s, p) => s + Number(p.amount), 0)
  return (<><h2>{cat.icon} {cat.name}</h2><p className="muted">{cat.description}</p>
    <p className="notice">MeetPol does not process or hold money. Supporters send money directly to you using the details you provide, then you confirm what you received.</p>
    {!session ? <button className="btn" onClick={signInWithGoogle}>Sign in to ask for a donation</button> : <>
      <form className="panel" onSubmit={submit}><h3>Take donations — tell people about yourself</h3><p className="notice">Your name, age, reason, description, phone, Gmail and bank details will be shown publicly on the Fund page once approved.</p><FieldsForm fields={requestFields} value={v} onChange={setV} />
        <div className="row"><button className="btn">Submit request</button><span className="muted">{msg}</span></div></form>
      <h3>My requests</h3>
      {mine.map(r => <div key={r.id} className="panel"><div className="row"><h3 style={{ margin: 0 }}>{r.reason || r.title}</h3><span className={'badge ' + r.status}>{r.status}</span></div>
        <p className="muted">{r.applicant_name}{r.age && ` · Age ${r.age}`}</p><p>{r.description || r.story}</p><Progress total={total(r.id)} goal={r.goal_amount} /><p className="muted">{total(r.id)} / {r.goal_amount} {r.currency} confirmed</p>
        {pledges.filter(p => p.request_id === r.id).map(p => <div key={p.id} className="pledge"><div><b>{p.funder_name || 'Supporter'}</b> pledged {p.amount} {r.currency}
          {p.reference && <> · ref {p.reference}</>}{p.message && <> · “{p.message}”</>} <span className={'badge ' + p.status}>{p.status}</span></div>
          {p.status === 'pledged' && <div className="row"><button className="btn" onClick={() => setStatus('fundings', p.id, 'confirmed')}>I received it</button>
            <button className="btn ghost" onClick={() => setStatus('fundings', p.id, 'rejected')}>Not received</button></div>}</div>)}
        <div className="row">{r.status === 'approved' && <button className="btn ghost" onClick={() => setStatus('donation_requests', r.id, 'closed')}>Close request</button>}
          {['pending', 'rejected'].includes(r.status) && <button className="btn ghost" onClick={() => del(r.id)}>Delete</button>}</div></div>)}
      {!mine.length && <p className="muted">You have no requests yet.</p>}</>}</>)
}
