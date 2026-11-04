import { useEffect, useRef, useState, ReactNode } from 'react'
import { Routes, Route, Link, Navigate, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { supabase } from './lib/supabase'
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
import Applications from './pages/Applications'
import MyApplications from './pages/MyApplications'

// Client-side guard for UX only; real protection is Row Level Security in the database.
function Guard({ roles, children }: { roles?: string[]; children: any }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className="muted center">Loading…</p>
  if (!session) return <Navigate to="/" replace />
  if (profile && !profile.onboarded && roles) return <Navigate to="/onboarding" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}
// Click-to-open dropdown; closes on outside click or navigation. On phones it shows inline inside the burger menu.
function Dropdown({ label, children, align = '', caret = true }: { label: ReactNode; children: ReactNode; align?: string; caret?: boolean }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  return <div className={'dd' + (open ? ' open' : '')} ref={ref}><button className="dd-btn" onClick={() => setOpen(!open)}>{label} {caret && <span className="caret">▾</span>}</button>
    <div className={'dd-menu ' + align} onClick={() => setOpen(false)}>{children}</div></div>
}
// 🔔 In-app notifications (created by database triggers); refreshes every 30s
function Bell() {
  const { session } = useAuth(); const nav = useNavigate(); const [items, setItems] = useState<any[]>([])
  const load = async () => setItems((await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(15)).data || [])
  useEffect(() => { if (!session) return; load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [session?.user.id])
  const unread = items.filter(n => !n.read).length
  const openNote = async (n: any) => { if (!n.read) await supabase.from('notifications').update({ read: true }).eq('id', n.id); load(); if (n.link) nav(n.link) }
  const readAll = async () => { await supabase.from('notifications').update({ read: true }).eq('read', false); load() }
  return <Dropdown align="right" caret={false} label={<span>🔔{unread > 0 && <b className="dot">{unread}</b>}</span>}>
    <div className="dd-head"><b>Notifications</b>{unread > 0 && <button className="linkbtn" onClick={e => { e.stopPropagation(); readAll() }}>Mark all read</button>}</div>
    <div className="notes">{items.map(n => <button key={n.id} className={'dd-item' + (n.read ? '' : ' unread')} onClick={() => openNote(n)}>{n.text}<small>{new Date(n.created_at).toLocaleString()}</small></button>)}
      {!items.length && <p className="muted" style={{ padding: 10 }}>Nothing yet.</p>}</div></Dropdown>
}
export default function App() {
  const { session, profile, avatar, categories, signInWithGoogle, signOut, settings } = useAuth()
  const [showSettings, setShowSettings] = useState(false); const [burger, setBurger] = useState(false)
  const loc = useLocation(); const role = profile?.role; const siteName = settings.site_name || 'MeetPol'
  useEffect(() => { initMusic(); initTranslate() }, [])
  useEffect(() => setBurger(false), [loc.pathname])
  useEffect(() => { document.title = `${siteName} — ${settings.hero_title || 'Where talent meets opportunity'}` }, [siteName, settings.hero_title])
  return (<>
    <Scene3D hero={loc.pathname === '/'} />
    <div id="google_translate_element" style={{ display: 'none' }} />
    {settings.announcement && <div className="banner">{settings.announcement}</div>}
    <header className="topbar"><div className="topbar-in">
      <Link to="/" className="logo" translate="no">{siteName}</Link>
      <button className="burger" onClick={() => setBurger(!burger)} aria-label="Menu">{burger ? '✕' : '☰'}</button>
      <nav className={'links' + (burger ? ' open' : '')}>
        <NavLink to="/postings">Jobs</NavLink>
        {categories.length > 0 && <Dropdown label="Explore">{categories.map((c: any) =>
          <NavLink key={c.id} className="dd-item" to={`/c/${c.slug}`}>{c.icon} {c.name} {c.coming_soon && (role === 'admin' || role === 'tester') && '🚧'}</NavLink>)}</Dropdown>}
        {(role === 'employer' || role === 'admin') && <NavLink to="/applicants">Applicants</NavLink>}
        {session && <Bell />}
        {session ? <Dropdown align="right" label={<span className="who"><Avatar url={avatar?.url} style={avatar?.style} size={30} name={avatar?.name} /><span>{(avatar?.name || 'Me').split(' ')[0]}</span></span>}>
          <div className="dd-head"><b>{avatar?.name}</b><small>{role}</small></div>
          {(role === 'seeker' || role === 'tester') && <NavLink to="/profile" className="dd-item">👤 My profile</NavLink>}
          {(role === 'seeker' || role === 'tester') && <NavLink to="/my-applications" className="dd-item">📨 My applications</NavLink>}
          {(role === 'employer' || role === 'admin') && <NavLink to="/applications" className="dd-item">📥 Applications received</NavLink>}
          {role === 'admin' && <NavLink to="/admin" className="dd-item">🛠 Admin dashboard</NavLink>}
          <button className="dd-item" onClick={() => setShowSettings(true)}>⚙ Settings</button>
          <button className="dd-item" onClick={signOut}>⏻ Sign out</button></Dropdown>
          : <><button className="btn" onClick={signInWithGoogle}>Sign in with Google</button>
            <button className="btn ghost" onClick={() => setShowSettings(true)} aria-label="Settings">⚙</button></>}
      </nav></div></header>
    <main key={loc.pathname} className="page"><Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
      <Route path="/profile" element={<Guard roles={['seeker', 'tester']}><MyProfile /></Guard>} />
      <Route path="/applicants" element={<Guard roles={['employer', 'admin']}><Applicants /></Guard>} />
      <Route path="/postings" element={<Postings />} />
      <Route path="/applications" element={<Guard roles={['employer', 'admin']}><Applications /></Guard>} />
      <Route path="/my-applications" element={<Guard roles={['seeker', 'tester']}><MyApplications /></Guard>} />
      <Route path="/c/:slug" element={<CategoryPage />} />
      <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes></main>
    <footer className="muted center">{settings.footer_text || '© MeetPol'}</footer>
    {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
  </>)
}
