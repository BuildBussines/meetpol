// Languages via Google Website Translator (free, translates the whole page, ~100+ languages).
const CODES = 'en af sq am ar hy az eu be bn bs bg ca ceb zh-CN zh-TW co hr cs da nl eo et fi fr fy gl ka de el gu ht ha haw he hi hmn hu is ig id ga it ja jv kn kk km rw ko ku ky lo la lv lt lb mk mg ms ml mt mi mr mn my ne no ny or ps fa pl pt pa ro ru sm gd sr st sn sd si sk sl so es su sw sv tl tg ta tt te th tr tk uk ur ug uz vi cy xh yi yo zu'.split(' ')
const en = new Intl.DisplayNames(['en'], { type: 'language' })
export function langLabel(c: string) {
  try { const n = new Intl.DisplayNames([c], { type: 'language' }).of(c), e = en.of(c); return n && n !== e ? `${n} — ${e}` : e || c } catch { return c }
}
export const LANGS = CODES.map(c => ({ code: c, label: langLabel(c), sort: (en.of(c) || c) })).sort((a, b) => a.sort.localeCompare(b.sort))
export const currentLang = () => (document.cookie.match(/googtrans=\/en\/([^;]+)/)?.[1]) || 'en'
export function setLanguage(code: string) {
  const h = location.hostname, past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
  if (code === 'en') { document.cookie = `googtrans=;${past};path=/`; document.cookie = `googtrans=;${past};path=/;domain=${h}` }
  else { document.cookie = `googtrans=/en/${code};path=/`; document.cookie = `googtrans=/en/${code};path=/;domain=${h}` }
  location.reload()
}
export function initTranslate() {
  if (currentLang() === 'en') return // only load Google's script when a language is chosen
  ;(window as any).gtInit = () => new (window as any).google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element')
  const s = document.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit'; document.body.appendChild(s)
}
