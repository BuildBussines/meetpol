import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { applicantFields, postingFields, settingFields, Field } from '../lib/fields'
import { FieldsForm, Modal } from '../components/ui'
// Admin RLS policies grant full access, so plain supabase calls work for every table here.
function Table({ table, fields, label }: { table: string; fields: Field[]; label: string }) {
  const [rows, setRows] = useState<any[]>([]); const [edit, setEdit] = useState<any>(null)
  const load = () => supabase.from(table).select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []))
  useEffect(() => { load() }, [table])
  const save = async (e: any) => { e.preventDefault(); const { id, created_at, ...rest } = edit; await supabase.from(table).update(rest).eq('id', id); setEdit(null); load() }
  const del = async (id: string) => { if (confirm('Delete permanently?')) { await supabase.from(table).delete().eq('id', id); load() } }
  return <><table><tbody>{rows.map(r => <tr key={r.id}><td>{r[label]}</td><td className="muted">{r.email || r.company || ''}</td>
    <td><button className="btn ghost" onClick={() => setEdit(r)}>Edit</button> <button className="btn ghost" onClick={() => del(r.id)}>Delete</button></td></tr>)}</tbody></table>
    {edit && <Modal title="Edit" onClose={() => setEdit(null)}><form onSubmit={save}><FieldsForm fields={fields} value={edit} onChange={setEdit} /><div className="row"><button className="btn">Save</button></div></form></Modal>}</>
}
function Users() {
  const [rows, setRows] = useState<any[]>([])
  const load = () => supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []))
  useEffect(() => { load() }, [])
  const setRole = async (id: string, role: string) => { await supabase.from('profiles').update({ role }).eq('id', id); load() }
  return <table><tbody>{rows.map(r => <tr key={r.id}><td>{r.email}</td><td><select value={r.role} onChange={e => setRole(r.id, e.target.value)}>{['seeker', 'employer', 'admin'].map(x => <option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table>
}
function Settings() {
  const { settings, loadSettings } = useAuth(); const [v, setV] = useState<any>(settings); const [m, setM] = useState('')
  const save = async (e: any) => { e.preventDefault(); await supabase.from('site_settings').upsert(settingFields.map(f => ({ key: f.key, value: v[f.key] ?? '' }))); await loadSettings(); setM('Saved ✓') }
  return <form onSubmit={save}><FieldsForm fields={settingFields} value={v} onChange={setV} /><div className="row"><button className="btn">Save settings</button><span className="muted">{m}</span></div></form>
}
export default function Admin() {
  const [tab, setTab] = useState('applicants')
  return <div className="panel"><h2>Admin dashboard</h2>
    <div className="row">{['applicants', 'postings', 'users', 'settings'].map(t => <button key={t} className={'btn' + (tab === t ? '' : ' ghost')} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'applicants' && <Table table="applicants" fields={applicantFields} label="name" />}
    {tab === 'postings' && <Table table="postings" fields={postingFields} label="title" />}
    {tab === 'users' && <Users />}{tab === 'settings' && <Settings />}</div>
}
