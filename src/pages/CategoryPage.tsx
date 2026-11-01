import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Tilt, Modal } from '../components/ui'

const fixUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : 'https://' + u)
export default function CategoryPage() {
  const { slug } = useParams(); const [cat, setCat] = useState<any>(null); const [items, setItems] = useState<any[]>([]); const [open, setOpen] = useState<any>(null); const [done, setDone] = useState(false)
  useEffect(() => {
    setDone(false)
    supabase.from('categories').select('*').eq('slug', slug).maybeSingle().then(async ({ data }) => {
      setCat(data)
      if (data) { const r = await supabase.from('category_items').select('*').eq('category_id', data.id).order('created_at', { ascending: false }); setItems(r.data || []) }
      setDone(true)
    })
  }, [slug])
  if (done && !cat) return <p className="muted center">Category not found.</p>
  if (!cat) return <p className="muted center">Loading…</p>
  const tpl = cat.kind === 'templates'
  return (<><h2>{cat.icon} {cat.name}</h2><p className="muted">{cat.description}</p>
    <div className="cards3">{items.map(i => <Tilt key={i.id}>
      {tpl && i.link_url
        ? <div className="thumb" onClick={() => setOpen(i)}><iframe src={fixUrl(i.link_url)} title={i.title} loading="lazy" tabIndex={-1} sandbox="allow-scripts allow-same-origin" /></div>
        : i.image_url && <img className="cover" src={i.image_url} alt="" />}
      <h3>{i.title}</h3><p>{i.description}</p>
      <div className="row">{tpl && i.link_url && <button className="btn" onClick={() => setOpen(i)}>Live preview</button>}
        {i.link_url && <a className="btn ghost" href={fixUrl(i.link_url)} target="_blank" rel="noreferrer">Open link ↗</a>}</div>
    </Tilt>)}{!items.length && <p className="muted">Nothing here yet.</p>}</div>
    {open && <Modal wide title={open.title} onClose={() => setOpen(null)}>
      <iframe className="full-preview" src={fixUrl(open.link_url)} title={open.title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
      <p className="muted">If the preview is blank, that website blocks embedding. Use “Open link”.</p>
      <a className="btn" href={fixUrl(open.link_url)} target="_blank" rel="noreferrer">Open in new tab ↗</a></Modal>}</>)
}
