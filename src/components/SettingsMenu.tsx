import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { Modal } from './ui'
import { LANGS, currentLang, setLanguage } from '../lib/lang'
import { isMusicOn, setMusic, getVol, setVol } from '../lib/music'

export default function SettingsMenu({ onClose }: { onClose: () => void }) {
  const { session, signOut } = useAuth()
  const [on, setOn] = useState(isMusicOn()); const [vol, setV] = useState(getVol())
  return <Modal title="⚙ Settings" onClose={onClose}>
    <label>🌐 Language<select value={currentLang()} onChange={e => setLanguage(e.target.value)}>{LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>
    <p className="muted">Pages are translated automatically by Google Translate.</p>
    <div className="row"><button className="btn" onClick={() => { setMusic(!on); setOn(!on) }}>{on ? '🔊 Music: ON' : '🔇 Music: OFF'}</button>
      <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e => { setV(+e.target.value); setVol(+e.target.value) }} /></div>
    <div className="row"><button className="btn ghost" onClick={() => {
      localStorage.removeItem('mp_music'); localStorage.removeItem('mp_vol'); setOn(true); setV(getVol()); setMusic(true)
      if (currentLang() !== 'en') setLanguage('en')   // reloads the page back to English
    }}>↺ Reset to default settings</button></div>
    {session && <div className="row"><button className="btn ghost" onClick={() => { signOut(); onClose() }}>Sign out</button></div>}
  </Modal>
}
