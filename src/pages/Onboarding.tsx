import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Tilt } from '../components/ui'
// First login: pick a side. Admin is never selectable (RLS forbids it too).
export default function Onboarding() {
  const { session, profile, refresh } = useAuth(); const nav = useNavigate()
  const home = (r: string) => (r === 'seeker' || r === 'tester' ? '/profile' : r === 'admin' ? '/admin' : '/applicants')
  useEffect(() => { if (profile?.onboarded) nav(home(profile.role), { replace: true }) }, [profile])
  const pick = async (role: string) => { await supabase.from('profiles').update({ role, onboarded: true }).eq('id', session.user.id); await refresh(); nav(home(role)) }
  return (<><h2 className="center">Welcome to MeetPol — who are you?</h2><div className="cards3">
    <Tilt><h3>🎓 I'm looking for a job</h3><button className="btn" onClick={() => pick('seeker')}>Job seeker</button></Tilt>
    <Tilt><h3>🏢 I'm hiring</h3><button className="btn" onClick={() => pick('employer')}>Employer</button></Tilt></div></>)
}
