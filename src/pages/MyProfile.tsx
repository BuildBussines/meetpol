import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { applicantFields } from '../lib/fields'
import { FieldsForm } from '../components/ui'
export default function MyProfile() {
  const { session } = useAuth()
  const [v, setV] = useState<any>({ email: session.user.email, name: session.user.user_metadata?.full_name || '' }); const [msg, setMsg] = useState('')
  useEffect(() => { supabase.from('applicants').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => data && setV(data)) }, [])
  const save = async (e: any) => {
    e.preventDefault(); const { id, created_at, ...rest } = v
    // upsert on user_id => one profile per user; RLS enforces ownership
    const { error } = await supabase.from('applicants').upsert({ ...rest, user_id: session.user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setMsg(error ? error.message : 'Saved ✓')
  }
  const del = async () => { if (confirm('Delete your profile?')) { await supabase.from('applicants').delete().eq('user_id', session.user.id); setV({}); setMsg('Deleted') } }
  return <form className="panel" onSubmit={save}><h2>My application profile</h2><FieldsForm fields={applicantFields} value={v} onChange={setV} />
    <div className="row"><button className="btn">Save profile</button>{v.id && <button type="button" className="btn ghost" onClick={del}>Delete</button>}<span className="muted">{msg}</span></div></form>
}
