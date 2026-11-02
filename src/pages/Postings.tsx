import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { postingFields } from '../lib/fields'
import { FieldsForm, Tilt } from '../components/ui'
export default function Postings() {
  const { session, profile } = useAuth()
  const [rows, setRows] = useState<any[]>([]); const [v, setV] = useState<any>({}); const [err, setErr] = useState('')
  const load = () => supabase.from('postings').select('*').order('created_at', { ascending: false }).then(({ data, error }) => { setRows(data || []); if (error) setErr(error.message) })
  useEffect(() => { load() }, [])
  const canPost = profile && ['employer', 'admin'].includes(profile.role)
  const add = async (e: any) => { e.preventDefault(); const { error } = await supabase.from('postings').insert({ ...v, employer_id: session.user.id }); setErr(error?.message || ''); if (!error) { setV({}); load() } }
  const del = async (id: string) => { await supabase.from('postings').delete().eq('id', id); load() }
  return (<><h2>Open roles</h2>{err && <p className="notice">{err}</p>}
    {canPost && <form className="panel" onSubmit={add}><h3>Post what you're looking for</h3><FieldsForm fields={postingFields} value={v} onChange={setV} /><div className="row"><button className="btn">Publish</button><span className="muted">{err}</span></div></form>}
    <div className="cards3">{rows.map(r => <Tilt key={r.id}><h3>{r.title}</h3><p className="muted">{r.company} {r.location && `· ${r.location}`}</p><p>{r.looking_for}</p>
      {r.employer_id === session?.user.id && <button className="btn ghost" onClick={() => del(r.id)}>Delete</button>}</Tilt>)}
      {!rows.length && <p className="muted">No postings yet. {canPost ? 'Use the form above to add one.' : 'Employers can sign in and post what they are looking for.'}</p>}</div></>)
}
