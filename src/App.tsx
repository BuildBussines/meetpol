import { Routes, Route, Link, Navigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Scene3D from './components/Scene3D'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import MyProfile from './pages/MyProfile'
import Applicants from './pages/Applicants'
import Postings from './pages/Postings'
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
  const { session, profile, signInWithGoogle, signOut, settings } = useAuth()
  const loc = useLocation(); const role = profile?.role
  return (<>
    <Scene3D hero={loc.pathname === '/'} />
    {settings.announcement && <div className="banner">{settings.announcement}</div>}
    <nav className="nav"><Link to="/" className="logo">Meet<b>Pol</b></Link>
      <div className="links"><NavLink to="/postings">Jobs</NavLink>
        {session && role === 'seeker' && <NavLink to="/profile">My profile</NavLink>}
        {(role === 'employer' || role === 'admin') && <NavLink to="/applicants">Applicants</NavLink>}
        {role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {session ? <button className="btn ghost" onClick={signOut}>Sign out</button> : <button className="btn" onClick={signInWithGoogle}>Sign in with Google</button>}
      </div></nav>
    <main key={loc.pathname} className="page"><Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
      <Route path="/profile" element={<Guard roles={['seeker']}><MyProfile /></Guard>} />
      <Route path="/applicants" element={<Guard roles={['employer', 'admin']}><Applicants /></Guard>} />
      <Route path="/postings" element={<Postings />} />
      <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes></main>
    <footer className="muted center">{settings.footer_text || '© MeetPol'}</footer>
  </>)
}
