import { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { initMusic } from './lib/music'
import { initTranslate } from './lib/lang'
import Scene3D from './components/Scene3D'
import SettingsMenu from './components/SettingsMenu'
import { Avatar } from './components/Avatar'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import MyProfile from './pages/MyProfile'
import Applicants from './pages/Applicants'
import Postings from './pages/Postings'
import CategoryPage from './pages/CategoryPage'
import Admin from './pages/Admin'

// Client-side guard for UX only; real protection is Row Level Security in the database.
function Guard({ roles, children }: { roles?: string[]; children: any }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className="muted center">Loading…</p>
  if (!session) return <Navigate to="/" replace />
  if (profile && !profile.onboarded && roles) return <Navigate to="/onboarding" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}
export default function App() {
  const { session, profile, avatar, categories, signInWithGoogle, settings } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const loc = useLocation(); const role = profile?.role; const siteName = settings.site_name || 'MeetPol'
  useEffect(() => { initMusic(); initTranslate() }, [])
  useEffect(() => { document.title = `${siteName} — ${settings.hero_title || 'Where talent meets opportunity'}` }, [siteName, settings.hero_title])
  return (<>
    <Scene3D hero={loc.pathname === '/'} />
    <div id="google_translate_element" style={{ display: 'none' }} />
    {settings.announcement && <div className="banner">{settings.announcement}</div>}
    <nav className="nav"><Link to="/" className="logo" translate="no">{siteName}</Link>
      <div className="links"><NavLink to="/postings">Jobs</NavLink>
        {categories.map((c: any) => <NavLink key={c.id} to={`/c/${c.slug}`}>{c.coming_soon && '🚧 '}{c.icon} {c.name}</NavLink>)}
        {session && role === 'seeker' && <NavLink to="/profile">My profile</NavLink>}
        {(role === 'employer' || role === 'admin') && <NavLink to="/applicants">Applicants</NavLink>}
        {role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {session && avatar && <Link to={role === 'seeker' ? '/profile' : '/'}><Avatar url={avatar.url} style={avatar.style} size={38} name={avatar.name} /></Link>}
        {!session && <button className="btn" onClick={signInWithGoogle}>Sign in with Google</button>}
        <button className="btn ghost" onClick={() => setShowSettings(true)}>⚙ Settings</button>
      </div></nav>
    <main key={loc.pathname} className="page"><Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
      <Route path="/profile" element={<Guard roles={['seeker']}><MyProfile /></Guard>} />
      <Route path="/applicants" element={<Guard roles={['employer', 'admin']}><Applicants /></Guard>} />
      <Route path="/postings" element={<Postings />} />
      <Route path="/c/:slug" element={<CategoryPage />} />
      <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes></main>
    <footer className="muted center">{settings.footer_text || '© MeetPol'}</footer>
    {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
  </>)
}
