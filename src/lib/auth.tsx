import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
const Ctx = createContext<any>(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const loadProfile = async (uid?: string) => {
    if (!uid) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    setProfile(data)
  }
  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*')
    setSettings(Object.fromEntries((data || []).map((r: any) => [r.key, r.value])))
  }
  useEffect(() => {
    loadSettings()
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); await loadProfile(data.session?.user.id); setLoading(false) })
    // setTimeout avoids calling supabase inside the auth callback (can deadlock)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => loadProfile(s?.user.id), 0) })
    return () => sub.subscription.unsubscribe()
  }, [])
  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/onboarding' } })
  const signOut = () => supabase.auth.signOut()
  return <Ctx.Provider value={{ session, profile, loading, settings, loadSettings, refresh: () => loadProfile(session?.user.id), signInWithGoogle, signOut }}>{children}</Ctx.Provider>
}
