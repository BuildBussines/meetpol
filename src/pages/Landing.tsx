import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'
import { Tilt } from '../components/ui'
export default function Landing() {
  const { settings, session, signInWithGoogle } = useAuth()
  return (<><section className="hero"><h1>{settings.hero_title || 'Where talent meets opportunity'}</h1><p>{settings.hero_subtitle}</p>
    <div className="row">{session ? <Link className="btn" to="/postings">Browse jobs</Link> : <button className="btn" onClick={signInWithGoogle}>Get started with Google</button>}</div></section>
    <section className="cards3">
      <Tilt><h3>🎓 Job seekers</h3><p>Build one rich profile and let employers find you.</p></Tilt>
      <Tilt><h3>🏢 Employers</h3><p>Review applicant profiles and post exactly who you want to hire.</p></Tilt>
      <Tilt><h3>🔒 Private by design</h3><p>Row Level Security keeps your data editable only by you.</p></Tilt></section></>)
}
