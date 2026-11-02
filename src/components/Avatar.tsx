export type PhotoStyle = { shape?: string; zoom?: number; x?: number; y?: number; border?: string; borderW?: number }
export const defaultStyle: PhotoStyle = { shape: 'circle', zoom: 1, x: 0, y: 0, border: '#7c5cff', borderW: 2 }
// Fully customizable picture: shape, zoom, position and border are stored per user in applicants.photo_style
export function Avatar({ url, style, size = 40, name }: { url?: string | null; style?: PhotoStyle; size?: number; name?: string }) {
  const s = style || {}
  const radius = s.shape === 'square' ? '6px' : s.shape === 'rounded' ? '24%' : '50%'
  const box: any = { width: size, height: size, borderRadius: radius }
  if (!url) return <div className="avatar" style={box}>{(name || '?')[0]?.toUpperCase()}</div>
  return <div className="avatar" style={{ ...box, border: `${s.borderW ?? 2}px solid ${s.border || '#7c5cff'}` }}>
    <img src={url} alt="" referrerPolicy="no-referrer" style={{ transform: `translate(${s.x || 0}%, ${s.y || 0}%) scale(${s.zoom || 1})` }} /></div>
}
