import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
const Ctx = createContext<any>(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [avatar, setAvatar] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const loadProfile = async (uid?: string) => {
    if (!uid) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle(); setProfile(data)
  }
  // Picture shown after sign-in: the user's custom photo, else their Google picture
  const loadAvatar = async (user?: any) => {
    if (!user) { setAvatar(null); return }
    const { data } = await supabase.from('applicants').select('name,photo_url,photo_style').eq('user_id', user.id).maybeSingle()
    const m = user.user_metadata || {}
    setAvatar({ url: data?.photo_url || m.avatar_url || m.picture || null, style: data?.photo_style || {}, name: data?.name || m.full_name || user.email })
  }
  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*')
    setSettings(Object.fromEntries((data || []).map((r: any) => [r.key, r.value])))
  }
  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('created_at'); setCategories(data || [])
  }
  useEffect(() => {
    loadSettings(); loadCategories()
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); await loadProfile(data.session?.user.id); await loadAvatar(data.session?.user); await loadCategories(); setLoading(false) })
    // setTimeout avoids calling supabase inside the auth callback (can deadlock)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => { loadProfile(s?.user.id); loadAvatar(s?.user); loadCategories() }, 0) })
    return () => sub.subscription.unsubscribe()
  }, [])
  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/onboarding' } })
  const signOut = () => supabase.auth.signOut()
  return <Ctx.Provider value={{ session, profile, avatar, categories, loading, settings, loadSettings, loadCategories, refresh: () => loadProfile(session?.user.id), refreshAvatar: () => loadAvatar(session?.user), signInWithGoogle, signOut }}>{children}</Ctx.Provider>
}
