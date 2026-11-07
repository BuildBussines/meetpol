import { Icon } from '../components/Icon'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { fundFields } from '../lib/fields'
import { FieldsForm, Modal, Tilt } from '../components/ui'
import { Progress } from './DonationsPage'

// Fund page: browse approved donation requests and pledge money; the requester confirms receipt.
export default function FundPage({ cat }: { cat: any }) {
  const { session, signInWithGoogle } = useAuth()
  const [reqs, setReqs] = useState<any[]>([]); const [totals, setTotals] = useState<any>({}); const [mine, setMine] = useState<any[]>([])
  const [open, setOpen] = useState<any>(null); const [v, setV] = useState<any>({}); const [msg, setMsg] = useState('')
  const load = async () => {
    setReqs((await supabase.from('donation_requests').select('*').eq('status', 'approved').order('created_at', { ascending: false })).data || [])
    const t = (await supabase.from('request_totals').select('*')).data || []; setTotals(Object.fromEntries(t.map((r: any) => [r.request_id, r])))
    if (session) setMine((await supabase.from('fundings').select('*').eq('funder_id', session.user.id).order('created_at', { ascending: false })).data || [])
  }
  useEffect(() => { load() }, [session?.user.id])
  const send = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('fundings').insert({ ...v, request_id: open.id, funder_id: session.user.id, funder_name: session.user.user_metadata?.full_name || session.user.email })
    if (error) return setMsg(error.message)
    setOpen(null); setV({}); setMsg(''); load()
  }
  return (<><h2><Icon name={cat.icon} />{cat.name}</h2><p className="muted">{cat.description}</p>
    <p className="notice">MeetPol does not process or hold money. Send money directly to the person using their details, then record your pledge here. Only fund people you trust.</p>
    <div className="cards3">{reqs.map(r => { const t = Number(totals[r.id]?.total || 0); return <Tilt key={r.id}>
      <h3>{r.reason || r.title}</h3><p className="muted">{r.applicant_name}{r.age && ` · Age ${r.age}`}</p><p>{r.description || r.story}</p><Progress total={t} goal={r.goal_amount} />
      <p className="muted">{t} / {r.goal_amount} {r.currency} · {totals[r.id]?.backers || 0} supporters</p>
      {session ? (r.user_id !== session.user.id ? <button className="btn" onClick={() => { setOpen(r); setMsg('') }}>Fund this</button> : <span className="muted">Your request</span>)
        : <button className="btn" onClick={signInWithGoogle}>Sign in to fund</button>}</Tilt>
    })}{!reqs.length && <p className="muted">No approved requests yet.</p>}</div>
    {session && mine.length > 0 && <><h3>My pledges</h3>{mine.map(p => <div key={p.id} className="pledge">
      {p.amount} to {(reqs.find(r => r.id === p.request_id)?.reason || reqs.find(r => r.id === p.request_id)?.title) || 'a request'} <span className={'badge ' + p.status}>{p.status}</span></div>)}</>}
    {open && <Modal title={`Fund: ${open.reason || open.title}`} onClose={() => setOpen(null)}>
      <p><b>{open.applicant_name}</b>{open.age && ` · Age ${open.age}`}</p><p>{open.description || open.story}</p>
      <p className="muted">{open.phone && <><Icon name="phone" />{open.phone}<br /></>}{open.email && <><Icon name="mail" />{open.email}</>}</p>
      <p><b>Send {open.currency} to:</b></p><p className="notice" style={{ whiteSpace: 'pre-wrap' }}>{open.bank_account || open.payment_info}</p>
      <form onSubmit={send}><FieldsForm fields={fundFields} value={v} onChange={setV} />
        <div className="row"><button className="btn">I sent it — record pledge</button><span className="muted">{msg}</span></div></form></Modal>}</>)
}
