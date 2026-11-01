// Procedural ambient lo-fi loop (Am–F–C–G) made with the Web Audio API: no audio files, no copyright.
let ctx: AudioContext | null = null, master: GainNode, fxIn: GainNode, timer: any = null, next = 0, step = 0, running = false
const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
export const isMusicOn = () => localStorage.getItem('mp_music') !== 'off'
export const getVol = () => { const v = parseFloat(localStorage.getItem('mp_vol') || ''); return isNaN(v) ? 0.4 : v }

function tone(f: number, t: number, dur: number, type: OscillatorType, peak: number, atk: number, dest: AudioNode, detune = 0) {
  const o = ctx!.createOscillator(), g = ctx!.createGain()
  o.type = type; o.frequency.value = f; o.detune.value = detune
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.1)
}
function bar(t: number, ch: number[]) {
  const pad = ctx!.createBiquadFilter(); pad.type = 'lowpass'; pad.frequency.value = 900; pad.connect(master)
  ch.forEach(n => [-7, 7].forEach(d => tone(mtof(n), t, 4.6, 'sawtooth', 0.035, 1.2, pad, d)))   // soft pad
  tone(mtof(ch[0] - 12), t, 3.8, 'sine', 0.22, 0.05, master)                                    // bass
  ;[0, 1, 2, 1, 2, 1, 0, 2].forEach((p, i) => tone(mtof(ch[p] + 12), t + i * 0.5, 1.4, 'triangle', 0.1, 0.02, fxIn)) // arp
}
function schedule() { while (ctx && next < ctx.currentTime + 2) { bar(next, chords[step % 4]); next += 4; step++ } }

export function startMusic() {
  if (running) return
  const AC = window.AudioContext || (window as any).webkitAudioContext
  ctx = ctx || new AC(); ctx!.resume()
  if (!master) {
    master = ctx!.createGain(); master.gain.value = 0; master.connect(ctx!.destination)
    fxIn = ctx!.createGain(); const d = ctx!.createDelay(); d.delayTime.value = 0.375; const fb = ctx!.createGain(); fb.gain.value = 0.35
    fxIn.connect(master); fxIn.connect(d); d.connect(fb); fb.connect(d); d.connect(master)          // echo
  }
  master.gain.setTargetAtTime(getVol() * 0.6, ctx!.currentTime, 0.5)
  next = ctx!.currentTime + 0.1; running = true; schedule(); timer = setInterval(schedule, 500)
}
export function stopMusic() {
  running = false; clearInterval(timer)
  if (ctx && master) { master.gain.setTargetAtTime(0, ctx.currentTime, 0.2); setTimeout(() => { if (!running) ctx?.suspend() }, 900) }
}
export function setMusic(on: boolean) { localStorage.setItem('mp_music', on ? 'on' : 'off'); on ? startMusic() : stopMusic() }
export function setVol(v: number) { localStorage.setItem('mp_vol', String(v)); if (ctx && master && running) master.gain.setTargetAtTime(v * 0.6, ctx.currentTime, 0.1) }
// Browsers block autoplay, so music starts on the visitor's first click/tap/key if it's switched on.
export function initMusic() {
  const go = () => { if (isMusicOn()) startMusic(); ['pointerdown', 'keydown'].forEach(e => window.removeEventListener(e, go)) }
  ;['pointerdown', 'keydown'].forEach(e => window.addEventListener(e, go))
}
