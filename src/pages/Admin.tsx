import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { applicantFields, postingFields, settingFields, categoryFields, itemFields } from '../lib/fields'
import { FieldsForm, Modal } from '../components/ui'

// Admin RLS policies grant full access, so plain supabase calls work for every table here.
// Reusable list + edit + delete (+ optional add form). `where` filters rows, `prepare` tweaks rows before insert.
function Table({ table, fields, label, where, defaults, prepare, add, extra, onChange }: any) {
  const [rows, setRows] = useState<any[]>([]); const [edit, setEdit] = useState<any>(null); const [nv, setNv] = useState<any>({}); const [err, setErr] = useState('')
  const load = () => { let q: any = supabase.from(table).select('*'); if (where) q = q.eq(where[0], where[1]); q.order('created_at', { ascending: false }).then(({ data }: any) => setRows(data || [])) }
  useEffect(() => { load() }, [table, where?.[1]])
  const done = (error: any) => { setErr(error?.message || ''); if (!error) { load(); onChange?.() } return !error }
  const save = async (e: any) => { e.preventDefault(); const { id, created_at, ...rest } = edit; if (done((await supabase.from(table).update(rest).eq('id', id)).error)) setEdit(null) }
  const del = async (id: string) => { if (confirm('Delete permanently?')) done((await supabase.from(table).delete().eq('id', id)).error) }
  const create = async (e: any) => { e.preventDefault(); const row = { ...defaults, ...nv }; if (done((await supabase.from(table).insert(prepare ? prepare(row) : row)).error)) setNv({}) }
  return <>
    {add && <form onSubmit={create}><h3>Add new</h3><FieldsForm fields={fields} value={nv} onChange={setNv} /><div className="row"><button className="btn">Add</button></div></form>}
    <p className="muted">{err}</p>
    <table><tbody>{rows.map(r => <tr key={r.id}><td>{r.icon} {r[label]}</td><td className="muted">{r.email || r.company || r.link_url || r.kind || ''}</td>
      <td>{extra?.(r)} <button className="btn ghost" onClick={() => setEdit(r)}>Edit</button> <button className="btn ghost" onClick={() => del(r.id)}>Delete</button></td></tr>)}</tbody></table>
    {edit && <Modal title="Edit" onClose={() => setEdit(null)}><form onSubmit={save}><FieldsForm fields={fields} value={edit} onChange={setEdit} /><div className="row"><button className="btn">Save</button></div></form></Modal>}</>
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category'

// Create any category (donations, fund, templates…). Type "templates" shows live website previews.
function Categories() {
  const { loadCategories } = useAuth(); const [sel, setSel] = useState<any>(null)
  return <><Table table="categories" fields={categoryFields} label="name" add onChange={loadCategories}
    prepare={(r: any) => ({ ...r, kind: r.kind || 'generic', slug: slugify(r.name) })}
    extra={(r: any) => <button className="btn" onClick={() => setSel(r)}>Items</button>} />
    {sel && <div className="panel"><h3>Items in “{sel.name}” {sel.kind === 'templates' && '(paste a website link — it will be previewed)'}</h3>
      <Table key={sel.id} table="category_items" fields={itemFields} label="title" where={['category_id', sel.id]} defaults={{ category_id: sel.id }} add /></div>}</>
}
function Users() {
  const [rows, setRows] = useState<any[]>([])
  const load = () => supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []))
  useEffect(() => { load() }, [])
  const setRole = async (id: string, role: string) => { await supabase.from('profiles').update({ role }).eq('id', id); load() }
  return <table><tbody>{rows.map(r => <tr key={r.id}><td>{r.email}</td><td><select value={r.role} onChange={e => setRole(r.id, e.target.value)}>{['seeker', 'employer', 'admin'].map(x => <option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table>
}
// FIX: the form now re-syncs when settings load, and save errors are shown instead of a fake "Saved".
function Settings() {
  const { settings, loadSettings } = useAuth(); const [v, setV] = useState<any>({}); const [m, setM] = useState('')
  useEffect(() => { setV(settings) }, [settings])
  const save = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('site_settings').upsert(settingFields.map(f => ({ key: f.key, value: v[f.key] ?? '' })), { onConflict: 'key' })
    if (error) return setM('Error: ' + error.message)
    await loadSettings(); setM('Saved ✓ — live now')
  }
  return <form onSubmit={save}><FieldsForm fields={settingFields} value={v} onChange={setV} /><div className="row"><button className="btn">Save settings</button><span className="muted">{m}</span></div></form>
}
export default function Admin() {
  const [tab, setTab] = useState('settings')
  return <div className="panel"><h2>Admin dashboard</h2>
    <div className="row">{['settings', 'categories', 'applicants', 'postings', 'users'].map(t => <button key={t} className={'btn' + (tab === t ? '' : ' ghost')} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'settings' && <Settings />}{tab === 'categories' && <Categories />}
    {tab === 'applicants' && <Table table="applicants" fields={applicantFields} label="name" />}
    {tab === 'postings' && <Table table="postings" fields={postingFields} label="title" />}
    {tab === 'users' && <Users />}</div>
}
