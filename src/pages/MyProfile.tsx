import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { applicantFields } from '../lib/fields'
import { FieldsForm } from '../components/ui'
import { Avatar } from '../components/Avatar'

export default function MyProfile() {
  const { session, refreshAvatar } = useAuth()
  const [v, setV] = useState<any>({ email: session.user.email, name: session.user.user_metadata?.full_name || '' }); const [msg, setMsg] = useState('')
  useEffect(() => { supabase.from('applicants').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => data && setV(data)) }, [])
  const st = v.photo_style || {}; const setSt = (p: any) => setV({ ...v, photo_style: { ...st, ...p } })
  // Upload into the user's own folder in the public "avatars" bucket (RLS limits writes to <uid>/...)
  const upload = async (e: any) => {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 3 * 1024 * 1024) return setMsg('Photo must be under 3 MB')
    const path = `${session.user.id}/${Date.now()}.${(f.name.split('.').pop() || 'jpg').toLowerCase()}`
    const { error } = await supabase.storage.from('avatars').upload(path, f, { contentType: f.type })
    if (error) return setMsg(error.message)
    setV({ ...v, photo_url: supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl }); setMsg('Photo uploaded — press Save profile')
  }
  const save = async (e: any) => {
    e.preventDefault(); const { id, created_at, ...rest } = v
    const { error } = await supabase.from('applicants').upsert({ ...rest, user_id: session.user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setMsg(error ? error.message : 'Saved ✓'); if (!error) { refreshAvatar(); setV({ ...v }) }
  }
  const del = async () => { if (confirm('Delete your profile?')) { await supabase.from('applicants').delete().eq('user_id', session.user.id); setV({}); setMsg('Deleted'); refreshAvatar() } }
  return <form className="panel" onSubmit={save}><h2>My application profile</h2>
    <div className="photo-edit"><Avatar url={v.photo_url} style={st} size={150} name={v.name} />
      <div className="grid">
        <label className="full">Profile picture<input type="file" accept="image/*" onChange={upload} /></label>
        <label>Shape<select value={st.shape || 'circle'} onChange={e => setSt({ shape: e.target.value })}><option value="circle">Circle</option><option value="rounded">Rounded</option><option value="square">Square</option></select></label>
        <label>Border color<input type="color" value={st.border || '#7c5cff'} onChange={e => setSt({ border: e.target.value })} /></label>
        <label>Zoom<input type="range" min="1" max="3" step="0.05" value={st.zoom || 1} onChange={e => setSt({ zoom: +e.target.value })} /></label>
        <label>Border width<input type="range" min="0" max="10" value={st.borderW ?? 2} onChange={e => setSt({ borderW: +e.target.value })} /></label>
        <label>Move left / right<input type="range" min="-50" max="50" value={st.x || 0} onChange={e => setSt({ x: +e.target.value })} /></label>
        <label>Move up / down<input type="range" min="-50" max="50" value={st.y || 0} onChange={e => setSt({ y: +e.target.value })} /></label>
      </div></div>
    <FieldsForm fields={applicantFields} value={v} onChange={setV} />
    <div className="row"><button className="btn">Save profile</button>{v.id && <button type="button" className="btn ghost" onClick={del}>Delete</button>}<span className="muted">{msg}</span></div></form>
}
