import { Icon } from '../components/Icon'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Tilt } from '../components/ui'
import { homeDefaults } from '../lib/fields'

// "Where *talent* meets" -> highlights the starred word; with no stars, highlights the 2nd word
function title(t: string) {
  if (/\*[^*]+\*/.test(t)) return t.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : p))
  const w = t.split(' '); return w.length < 2 ? t : <>{w[0]} <em>{w[1]}</em> {w.slice(2).join(' ')}</>
}
export default function Landing() {
  const { settings, session, signInWithGoogle } = useAuth(); const [stats, setStats] = useState<any>(null)
  useEffect(() => { supabase.from('public_stats').select('*').maybeSingle().then(({ data }) => setStats(data)) }, [])
  const g = (k: string) => settings[k] || homeDefaults[k] || ''   // admin value, else built-in default
  return (<><section className="hero"><span className="hero-pill">● {g('hero_badge')}</span><h1>{title(g('hero_title'))}</h1><p>{g('hero_subtitle')}</p>
    <div className="row">{!session && <button className="btn" onClick={signInWithGoogle}>Get started with Google</button>}
      <Link className={session ? 'btn' : 'btn ghost'} to="/postings">Browse jobs</Link></div>
    {stats && <div className="stats"><div><b>{stats.seekers}</b><span>Job seekers</span></div><div><b>{stats.roles}</b><span>Open roles</span></div><div><b>{stats.campaigns}</b><span>Donation campaigns</span></div></div>}</section>
    <section className="cards3">{[1, 2, 3].map(i => { const link = g(`box${i}_link`), color = g(`box${i}_color`) || '#c8f432'; return (
      <Tilt key={i} className="home-card" style={{ borderTop: `3px solid ${color}`, boxShadow: `0 10px 40px ${color}22` }}>
        <h3><Icon name={g(`box${i}_icon`)} size={22} />{g(`box${i}_title`)}</h3><p>{g(`box${i}_text`)}</p>
        {link && (link.startsWith('/') ? <Link className="btn ghost" to={link}>Learn more<Icon name="arrow-right" className="after" /></Link> : <a className="btn ghost" href={link} target="_blank" rel="noreferrer">Learn more<Icon name="arrow-right" className="after" /></a>)}
      </Tilt>) })}</section></>)
}
