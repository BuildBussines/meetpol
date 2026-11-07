import { designDefaults, HEAD_FONTS, BODY_FONTS } from './fields'
const SIZE: any = { Small: '15px', Normal: '16px', Large: '17.5px', 'Extra large': '19px' }
const HS: any = { Compact: 0.8, Normal: 1, Large: 1.2, Huge: 1.45 }
const lum = (hex: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return 0; const n = parseInt(m[1], 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }

// Applies the admin's "Design & text" choices to the whole site through CSS variables
export function applyTheme(s: Record<string, string>) {
  const g = (k: string) => s[k] || designDefaults[k]
  const r = document.documentElement.style
  const fh = HEAD_FONTS[g('font_heading')] ? g('font_heading') : designDefaults.font_heading, fb = BODY_FONTS[g('font_body')] ? g('font_body') : designDefaults.font_body
  const fams = fh === fb ? [BODY_FONTS[fb]] : [HEAD_FONTS[fh].spec, BODY_FONTS[fb]]
  const href = 'https://fonts.googleapis.com/css2?' + fams.map(f => 'family=' + f).join('&') + '&display=swap'
  let l = document.getElementById('mp-fonts') as HTMLLinkElement | null
  if (!l) { l = document.createElement('link'); l.id = 'mp-fonts'; l.rel = 'stylesheet'; document.head.appendChild(l) }
  if (l.href !== href) l.href = href
  r.setProperty('--font-head', `'${fh}'`); r.setProperty('--font-body', `'${fb}'`); r.setProperty('--h-weight', String(HEAD_FONTS[fh].w))
  r.fontSize = SIZE[g('text_size')] || '16px'; r.setProperty('--h-scale', String(HS[g('heading_size')] || 1))
  const a = g('accent_color')
  r.setProperty('--fg', g('text_color')); r.setProperty('--mut', g('muted_color')); r.setProperty('--a', a); r.setProperty('--b', a)
  r.setProperty('--on-a', lum(a) > 0.4 ? '#0b0b0c' : '#ffffff')   // readable text on the accent color
}
