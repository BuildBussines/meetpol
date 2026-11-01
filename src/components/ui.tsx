import { useState, ReactNode } from 'react'
import { Field } from '../lib/fields'
// CSS-3D tilt card: rotates toward the cursor
export function Tilt({ children }: { children: ReactNode }) {
  const [s, setS] = useState('')
  return <div className="card" style={{ transform: s }}
    onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; setS(`perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(6px)`) }}
    onMouseLeave={() => setS('')}>{children}</div>
}
export function FieldsForm({ fields, value, onChange }: { fields: Field[]; value: any; onChange: (v: any) => void }) {
  const set = (k: string, val: any) => onChange({ ...value, [k]: val })
  return <div className="grid">{fields.map(f => <label key={f.key} className={f.type === 'textarea' ? 'full' : ''}>{f.label}
    {f.type === 'textarea' ? <textarea rows={3} required={f.req} value={value[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} />
      : f.type === 'select' ? <select value={value[f.key] ?? f.options![0]} onChange={e => set(f.key, e.target.value)}>{f.options!.map(o => <option key={o}>{o}</option>)}</select>
      : <input type={f.type || 'text'} required={f.req} value={value[f.key] ?? ''} onChange={e => set(f.key, f.type === 'number' ? (e.target.value === '' ? null : +e.target.value) : e.target.value)} />}
  </label>)}</div>
}
export function Modal({ title, children, onClose, wide }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="modal" onClick={onClose}><div className={'panel' + (wide ? ' wide' : '')} onClick={e => e.stopPropagation()}><h3>{title}</h3>{children}</div></div>
}
