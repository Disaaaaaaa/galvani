// WebAudio арқылы синтезделген қысқа дыбыстар (§52). Файл жүктеудің қажеті жоқ.
import { useApp } from '../store/useApp'

let ctx = null
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq = 440, to = null, dur = 0.12, type = 'sine', gain = 0.08, delay = 0 }) {
  const a = ac()
  if (!a) return
  const t0 = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(a.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

const SOUNDS = {
  click: () => tone({ freq: 660, dur: 0.06, type: 'triangle', gain: 0.05 }),
  correct: () => {
    tone({ freq: 523, dur: 0.12, type: 'triangle' })
    tone({ freq: 659, dur: 0.12, type: 'triangle', delay: 0.09 })
    tone({ freq: 880, dur: 0.22, type: 'triangle', delay: 0.18 })
  },
  wrong: () => {
    tone({ freq: 240, to: 160, dur: 0.22, type: 'sawtooth', gain: 0.04 })
  },
  start: () => {
    tone({ freq: 220, to: 660, dur: 0.35, type: 'sine', gain: 0.07 })
  },
  electron: () => tone({ freq: 1400, to: 1900, dur: 0.05, type: 'sine', gain: 0.025 }),
  zap: () => {
    tone({ freq: 1800, to: 300, dur: 0.18, type: 'square', gain: 0.03 })
  },
  snap: () => tone({ freq: 880, to: 1320, dur: 0.08, type: 'triangle', gain: 0.06 }),
}

export function play(name) {
  if (!useApp.getState().settings.sound) return
  try {
    SOUNDS[name]?.()
  } catch {
    /* дыбыс міндетті емес */
  }
}
