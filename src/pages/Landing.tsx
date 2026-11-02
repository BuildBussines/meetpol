import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'
import { Tilt } from '../components/ui'
import { homeDefaults } from '../lib/fields'

export default function Landing() {
  const { settings, session, signInWithGoogle } = useAuth()
  const g = (k: string) => settings[k] || homeDefaults[k] || ''   // admin value, else built-in default
  return (<><section className="hero"><h1>{g('hero_title')}</h1><p>{g('hero_subtitle')}</p>
    <div className="row">{session ? <Link className="btn" to="/postings">Browse jobs</Link> : <button className="btn" onClick={signInWithGoogle}>Get started with Google</button>}</div></section>
    <section className="cards3">{[1, 2, 3].map(i => { const link = g(`box${i}_link`), color = g(`box${i}_color`) || '#7c5cff'; return (
      <Tilt key={i} className="home-card" style={{ borderTop: `4px solid ${color}`, boxShadow: `0 10px 40px ${color}33` }}>
        <h3>{g(`box${i}_icon`)} {g(`box${i}_title`)}</h3><p>{g(`box${i}_text`)}</p>
        {link && (link.startsWith('/') ? <Link className="btn ghost" to={link}>Learn more →</Link> : <a className="btn ghost" href={link} target="_blank" rel="noreferrer">Learn more →</a>)}
      </Tilt>) })}</section></>)
}
