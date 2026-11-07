import { Icon } from '../components/Icon'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { postingFields } from '../lib/fields'
import { FieldsForm, Tilt, Modal } from '../components/ui'

export default function Postings() {
  const { session, profile, signInWithGoogle } = useAuth()
  const [rows, setRows] = useState<any[]>([]); const [v, setV] = useState<any>({}); const [err, setErr] = useState('')
  const [applied, setApplied] = useState<string[]>([]); const [counts, setCounts] = useState<any>({}); const [hasProfile, setHasProfile] = useState(true)
  const [open, setOpen] = useState<any>(null); const [msg, setMsg] = useState(''); const [note, setNote] = useState('')
  const isSeeker = !!profile && ['seeker', 'tester'].includes(profile.role)
  const canPost = !!profile && ['employer', 'admin'].includes(profile.role)
  const load = async () => {
    const r = await supabase.from('postings').select('*').order('created_at', { ascending: false }); setRows(r.data || []); if (r.error) setErr(r.error.message)
    if (session && isSeeker) {
      setApplied(((await supabase.from('applications').select('posting_id').eq('applicant_user_id', session.user.id)).data || []).map((a: any) => a.posting_id))
      setHasProfile(!!(await supabase.from('applicants').select('id').eq('user_id', session.user.id).maybeSingle()).data)
    }
    if (canPost) { const c: any = {}; ((await supabase.from('applications').select('posting_id')).data || []).forEach((a: any) => { c[a.posting_id] = (c[a.posting_id] || 0) + 1 }); setCounts(c) }
  }
  useEffect(() => { load() }, [session?.user.id, profile?.role])
  const add = async (e: any) => { e.preventDefault(); const { error } = await supabase.from('postings').insert({ ...v, employer_id: session.user.id }); setErr(error?.message || ''); if (!error) { setV({}); load() } }
  const del = async (id: string) => { await supabase.from('postings').delete().eq('id', id); load() }
  const apply = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('applications').insert({ posting_id: open.id, applicant_user_id: session.user.id, message: msg })
    if (error) return setNote(error.code === '23505' ? 'You already applied.' : error.message)
    setOpen(null); setMsg(''); setNote(''); load()
  }
  return (<><h2>Open roles</h2>{err && <p className="notice">{err}</p>}
    {canPost && <form className="panel" onSubmit={add}><h3>Post what you're looking for</h3><FieldsForm fields={postingFields} value={v} onChange={setV} /><div className="row"><button className="btn">Publish</button></div></form>}
    <div className="cards3">{rows.map(r => <Tilt key={r.id}><h3>{r.title}</h3><p className="muted">{r.company} {r.location && `· ${r.location}`}</p><p>{r.looking_for}</p>
      <div className="row">
        {isSeeker && (applied.includes(r.id) ? <span className="badge confirmed"><Icon name="check" size={14} />Applied</span> : <button className="btn" onClick={() => { setOpen(r); setNote('') }}>Apply</button>)}
        {!session && <button className="btn" onClick={signInWithGoogle}>Sign in to apply</button>}
        {canPost && <Link className="btn ghost" to="/applications"><Icon name="inbox" />{counts[r.id] || 0} applicants</Link>}
        {r.employer_id === session?.user.id && <button className="btn ghost" onClick={() => del(r.id)}>Delete</button>}</div></Tilt>)}
      {!rows.length && <p className="muted">No postings yet. {canPost ? 'Use the form above to add one.' : 'Employers can sign in and post what they are looking for.'}</p>}</div>
    {open && <Modal title={`Apply: ${open.title}`} onClose={() => setOpen(null)}>
      {!hasProfile ? <><p>Create your application profile first so employers can see who you are.</p><Link className="btn" to="/profile">Create my profile</Link></>
        : <form onSubmit={apply}><p className="muted">Your profile is sent with your application.</p>
          <label>Message to the employer (optional)<textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)} /></label>
          <div className="row"><button className="btn">Send application</button><span className="muted">{note}</span></div></form>}</Modal>}</>)
}
