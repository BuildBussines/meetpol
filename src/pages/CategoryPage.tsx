import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Tilt, Modal } from '../components/ui'
import { fixUrl } from '../lib/url'
import DonationsPage from './DonationsPage'
import FundPage from './FundPage'

// What visitors see while "coming soon" is enabled for a category
function Poster({ cat }: { cat: any }) {
  return <div className="poster"><div className="poster-inner">
    {cat.poster_image && <img className="poster-img" src={cat.poster_image} alt="" />}
    <div className="poster-icon">🚧</div><h1>{cat.poster_title || 'Coming Soon'}</h1>
    <h2>{cat.icon} {cat.name}</h2><p>{cat.poster_text || 'We are building something awesome here. Stay tuned!'}</p></div></div>
}

export default function CategoryPage() {
  const { slug } = useParams(); const { session, profile, loading } = useAuth()
  const [cat, setCat] = useState<any>(null); const [items, setItems] = useState<any[]>([]); const [open, setOpen] = useState<any>(null)
  const [done, setDone] = useState(false); const [asVisitor, setAsVisitor] = useState(false)
  const canPreview = !!profile && (profile.role === 'admin' || profile.role === 'tester' || profile.is_tester)
  useEffect(() => {
    setDone(false); setAsVisitor(false)
    // Row Level Security returns no items for a coming-soon category unless you are admin/tester
    supabase.from('categories').select('*').eq('slug', slug).maybeSingle().then(async ({ data }) => {
      setCat(data)
      if (data) { const r = await supabase.from('category_items').select('*').eq('category_id', data.id).order('created_at', { ascending: false }); setItems(r.data || []) }
      setDone(true)
    })
  }, [slug, session?.user.id, profile?.role])
  if (loading) return <p className="muted center">Loading…</p>
  if (done && !cat) return <p className="muted center">Category not found.</p>
  if (!cat) return <p className="muted center">Loading…</p>
  if (cat.coming_soon && (!canPreview || asVisitor))
    return <>{asVisitor && <button className="btn ghost" onClick={() => setAsVisitor(false)}>← Back to the real page</button>}<Poster cat={cat} /></>

  const tpl = cat.kind === 'templates'
  const list = (<><div className="cards3">{items.map(i => <Tilt key={i.id}>
    {tpl && i.link_url
      ? <div className="thumb" onClick={() => setOpen(i)}><iframe src={fixUrl(i.link_url)} title={i.title} loading="lazy" tabIndex={-1} sandbox="allow-scripts allow-same-origin" /></div>
      : i.image_url && <img className="cover" src={i.image_url} alt="" />}
    <h3>{i.title}</h3><p>{i.description}</p>
    <div className="row">{tpl && i.link_url && <button className="btn" onClick={() => setOpen(i)}>Live preview</button>}
      {i.link_url && <a className="btn ghost" href={fixUrl(i.link_url)} target="_blank" rel="noreferrer">Open link ↗</a>}</div>
  </Tilt>)}</div>
    {open && <Modal wide title={open.title} onClose={() => setOpen(null)}>
      <iframe className="full-preview" src={fixUrl(open.link_url)} title={open.title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
      <p className="muted">If the preview is blank, that website blocks embedding. Use “Open link”.</p>
      <a className="btn" href={fixUrl(open.link_url)} target="_blank" rel="noreferrer">Open in new tab ↗</a></Modal>}</>)
  const banner = cat.coming_soon && <div className="notice row">🚧 Coming soon is ON — visitors only see a poster. You see the real page because you are an admin/tester.
    <button className="btn ghost" onClick={() => setAsVisitor(true)}>Preview the poster</button></div>
  if (cat.kind === 'donations' || cat.kind === 'fund') return <>{banner}{cat.kind === 'donations' ? <DonationsPage cat={cat} /> : <FundPage cat={cat} />}{items.length > 0 && <><h3>More in {cat.name}</h3>{list}</>}</>
  return <>{banner}<h2>{cat.icon} {cat.name}</h2><p className="muted">{cat.description}</p>{list}{!items.length && <p className="muted">Nothing here yet.</p>}</>
}
