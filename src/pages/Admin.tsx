import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { applicantFields, postingFields, siteFields, homeFields, homeDefaults, categoryFields, itemFields } from '../lib/fields'
import { FieldsForm, Modal } from '../components/ui'
import { fixUrl } from '../lib/url'

// Admin RLS policies grant full access, so plain supabase calls work for every table here.
// Reusable list + edit + delete (+ optional add form). `where` filters rows, `prepare` tweaks rows before insert.
function Table({ table, fields, label, where, defaults, prepare, add, extra, onChange, preview, initial }: any) {
  const [rows, setRows] = useState<any[]>([]); const [edit, setEdit] = useState<any>(null); const [nv, setNv] = useState<any>(initial || {}); const [err, setErr] = useState('')
  const load = () => { let q: any = supabase.from(table).select('*'); (Array.isArray(where?.[0]) ? where : where ? [where] : []).forEach((w: any) => { q = q.eq(w[0], w[1]) }); q.order('created_at', { ascending: false }).then(({ data }: any) => setRows(data || [])) }
  useEffect(() => { load() }, [table, JSON.stringify(where)])
  const done = (error: any) => { setErr(error?.message || ''); if (!error) { load(); onChange?.() } return !error }
  const save = async (e: any) => { e.preventDefault(); const { id, created_at, ...rest } = edit; if (done((await supabase.from(table).update(rest).eq('id', id)).error)) setEdit(null) }
  const del = async (id: string) => { if (confirm('Delete permanently?')) done((await supabase.from(table).delete().eq('id', id)).error) }
  const create = async (e: any) => { e.preventDefault(); const row = { ...defaults, ...nv }; if (done((await supabase.from(table).insert(prepare ? prepare(row) : row)).error)) setNv(initial || {}) }
  return <>
    {add && <form onSubmit={create}><h3>Add new</h3><FieldsForm fields={fields} value={nv} onChange={setNv} />
      {preview && nv.link_url && <><p className="muted">Live preview (blank = that site blocks embedding):</p><div className="thumb"><iframe src={fixUrl(nv.link_url)} title="preview" sandbox="allow-scripts allow-same-origin" /></div></>}
      <div className="row"><button className="btn">Add</button></div></form>}
    <p className="muted">{err}</p>
    <table><tbody>{rows.map(r => <tr key={r.id}><td>{r.icon} {r[label]} {r.coming_soon && <span className="badge pending">🚧 coming soon</span>}</td><td className="muted">{r.email || r.company || r.link_url || r.kind || ''}</td>
      <td>{extra?.(r, load)} <button className="btn ghost" onClick={() => setEdit(r)}>Edit</button> <button className="btn ghost" onClick={() => del(r.id)}>Delete</button></td></tr>)}</tbody></table>
    {edit && <Modal title="Edit" onClose={() => setEdit(null)}><form onSubmit={save}><FieldsForm fields={fields} value={edit} onChange={setEdit} /><div className="row"><button className="btn">Save</button></div></form></Modal>}</>
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category'

// Create any category (donations, fund, templates…). Type "templates" shows live website previews.
function Categories() {
  const { loadCategories } = useAuth(); const [sel, setSel] = useState<any>(null)
  return <><Table table="categories" fields={categoryFields} label="name" add onChange={loadCategories}
    prepare={(r: any) => ({ ...r, kind: r.kind || 'generic', slug: slugify(r.name) })}
    extra={(r: any, reload: any) => <><button className="btn" onClick={() => setSel(r)}>Items</button> <button className={r.coming_soon ? 'btn' : 'btn ghost'} onClick={async () => { await supabase.from('categories').update({ coming_soon: !r.coming_soon }).eq('id', r.id); reload(); loadCategories() }}>{r.coming_soon ? '🚧 Disable coming soon' : '🚧 Enable coming soon'}</button></>} />
    {sel && <div className="panel"><h3>Items in “{sel.name}” {sel.kind === 'templates' && '(paste a website link — it will be previewed)'}</h3>
      <Table key={sel.id} table="category_items" fields={itemFields} label="title" where={['category_id', sel.id]} defaults={{ category_id: sel.id }} add /></div>}</>
}
// Dedicated place to add website templates: paste a link, see the preview, press Add.
function Templates() {
  const { loadCategories } = useAuth(); const [cats, setCats] = useState<any[] | null>(null); const [cid, setCid] = useState('')
  const load = async () => { const { data } = await supabase.from('categories').select('*').eq('kind', 'templates'); setCats(data || []); if (data?.length) setCid((c: string) => c || data[0].id) }
  useEffect(() => { load() }, [])
  const create = async () => { await supabase.from('categories').insert({ name: 'Templates', slug: 'templates-' + Date.now().toString(36), kind: 'templates', icon: '🧩', description: 'Website templates with live preview.' }); await load(); loadCategories() }
  if (!cats) return <p className="muted">Loading…</p>
  if (!cats.length) return <div className="row"><p>No Templates category yet.</p><button className="btn" onClick={create}>Create Templates category</button></div>
  return <><h3>Add a website template</h3>
    {cats.length > 1 && <label>Category<select value={cid} onChange={e => setCid(e.target.value)}>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
    <Table key={cid} table="category_items" fields={itemFields} label="title" where={['category_id', cid]} defaults={{ category_id: cid }} add preview /></>
}
// Moderate donation requests and see/override pledges.
function Requests() {
  const [rows, setRows] = useState<any[]>([]); const [fund, setFund] = useState<any[]>([])
  const load = async () => {
    setRows((await supabase.from('donation_requests').select('*').order('created_at', { ascending: false })).data || [])
    setFund((await supabase.from('fundings').select('*').order('created_at', { ascending: false })).data || [])
  }
  useEffect(() => { load() }, [])
  const set = async (t: string, id: string, status: string) => { await supabase.from(t).update({ status }).eq('id', id); load() }
  const del = async (t: string, id: string) => { if (confirm('Delete permanently?')) { await supabase.from(t).delete().eq('id', id); load() } }
  const St = ({ t, r, opts }: any) => <select value={r.status} onChange={e => set(t, r.id, e.target.value)}>{opts.map((x: string) => <option key={x}>{x}</option>)}</select>
  return <><h3>Donation requests</h3><table><tbody>{rows.map(r => <tr key={r.id}><td><b>{r.reason || r.title}</b><br /><span className="muted">{r.applicant_name} {r.age && `· ${r.age}y`} · {r.phone} · {r.email}<br />{r.description}<br />Goal {r.goal_amount} {r.currency} · {r.bank_account || r.payment_info}</span></td>
    <td><St t="donation_requests" r={r} opts={['pending', 'approved', 'rejected', 'closed']} /> <button className="btn ghost" onClick={() => del('donation_requests', r.id)}>Delete</button></td></tr>)}</tbody></table>
    <h3>Pledges</h3><table><tbody>{fund.map(f => <tr key={f.id}><td>{f.funder_name} · {f.amount} → {(rows.find(r => r.id === f.request_id)?.reason || rows.find(r => r.id === f.request_id)?.title)}<br /><span className="muted">{f.reference} {f.message}</span></td>
      <td><St t="fundings" r={f} opts={['pledged', 'confirmed', 'rejected']} /> <button className="btn ghost" onClick={() => del('fundings', f.id)}>Delete</button></td></tr>)}</tbody></table></>
}
function Users() {
  const [rows, setRows] = useState<any[]>([])
  const load = () => supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []))
  useEffect(() => { load() }, [])
  const setRole = async (id: string, role: string) => { await supabase.from('profiles').update({ role }).eq('id', id); load() }
  return <table><tbody>{rows.map(r => <tr key={r.id}><td>{r.email}</td><td><select value={r.role} onChange={e => setRole(r.id, e.target.value)}>{['seeker', 'employer', 'tester', 'admin'].map(x => <option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table>
}
// FIX: the form now re-syncs when settings load, and save errors are shown instead of a fake "Saved".
function Settings({ fields }: { fields: any[] }) {
  const { settings, loadSettings } = useAuth(); const [v, setV] = useState<any>({}); const [m, setM] = useState('')
  useEffect(() => { setV({ ...homeDefaults, ...settings }) }, [settings])
  const save = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('site_settings').upsert(fields.map((f: any) => f).map(f => ({ key: f.key, value: v[f.key] ?? '' })), { onConflict: 'key' })
    if (error) return setM('Error: ' + error.message)
    await loadSettings(); setM('Saved ✓ — live now')
  }
  return <form onSubmit={save}><FieldsForm fields={fields} value={v} onChange={setV} /><div className="row"><button className="btn">Save settings</button><span className="muted">{m}</span></div></form>
}
// Overview cards with live counts; click one to jump to its section
function Overview({ go }: { go: (t: string) => void }) {
  const [n, setN] = useState<any>({})
  useEffect(() => { (async () => {
    const c = async (t: string, f?: (q: any) => any) => { let q: any = supabase.from(t).select('id', { count: 'exact', head: true }); if (f) q = f(q); return (await q).count || 0 }
    setN({ users: await c('profiles'), seekers: await c('applicants'), roles: await c('postings'), apps: await c('applications'), pending: await c('donation_requests', q => q.eq('status', 'pending')), pledges: await c('fundings') })
  })() }, [])
  const cards: any[] = [['users', 'Users', n.users, 'users'], ['seekers', 'Applicant profiles', n.seekers, 'applicants'], ['roles', 'Job postings', n.roles, 'postings'],
    ['apps', 'Applications', n.apps, 'postings'], ['pending', 'Requests awaiting approval', n.pending, 'requests'], ['pledges', 'Pledges', n.pledges, 'requests']]
  return <div className="stats-grid">{cards.map(([k, label, val, tab]) => <button key={k} className={'stat' + (k === 'pending' && val > 0 ? ' hot' : '')} onClick={() => go(tab)}><b>{val ?? '…'}</b><span>{label}</span></button>)}</div>
}
const NAV: [string, [string, string, string, string][]][] = [
  ['Overview', [['overview', '📊', 'Overview', 'A quick look at your platform.']]],
  ['Content', [['homepage', '🏠', 'Homepage', 'Edit the headline and the three boxes visitors see first.'], ['settings', '⚙️', 'Site settings', 'Site name, announcement banner and footer.'],
    ['templates', '🧩', 'Templates', 'Add website templates with live previews.'], ['categories', '🗂️', 'Categories', 'Create categories and turn coming soon on or off.']]],
  ['Community', [['requests', '💝', 'Donation requests', 'Approve requests and manage pledges.'], ['applicants', '🎓', 'Applicants', 'View, edit or delete applicant profiles.'], ['postings', '💼', 'Postings', 'Add, edit or delete job postings.']]],
  ['Access', [['users', '👥', 'Users & roles', 'Give roles: seeker, employer, tester or admin.']]],
]
export default function Admin() {
  const { session } = useAuth()
  const [tab, setTab] = useState('overview')
  const cur = NAV.flatMap(g => g[1]).find(x => x[0] === tab)!
  return <div className="admin">
    <aside className="admin-side"><div className="side-brand"><i>⚡</i> Admin</div>
      {NAV.map(([group, items]) => <div className="side-group" key={group}><div className="side-label">{group}</div>
        {items.map(([id, icon, label]) => <button key={id} className={'side-item' + (tab === id ? ' active' : '')} onClick={() => setTab(id)}><span>{icon}</span>{label}</button>)}</div>)}</aside>
    <section className="admin-main"><div className="admin-head"><h2>{cur[2]}</h2><p className="muted">{cur[3]}</p></div>
      {tab === 'overview' && <Overview go={setTab} />}
      {tab !== 'overview' && <div className="glass">
        {tab === 'homepage' && <Settings key="h" fields={homeFields} />}{tab === 'settings' && <Settings key="s" fields={siteFields} />}
        {tab === 'templates' && <Templates />}{tab === 'categories' && <Categories />}{tab === 'requests' && <Requests />}
        {tab === 'applicants' && <Table table="applicants" fields={applicantFields} label="name" />}
        {tab === 'postings' && <Table table="postings" fields={postingFields} label="title" add defaults={{ employer_id: session.user.id }} />}
        {tab === 'users' && <Users />}</div>}</section></div>
}
