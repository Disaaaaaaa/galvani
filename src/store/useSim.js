import { create } from 'zustand'

// 3D кадр сайын өзгеретін мәндер — React қайта рендерлеусіз оқылады.
export const live = {
  progress: 0, // реакция барысы 0..1
  charge: 0, // ыдыстардағы заряд теңсіздігі 0..1
  flow: 0, // ағымдағы электрон ағыны 0..1
  trackS: 0, // бақыланатын электронның саяхат фазасы 0..1
  trackPos: null, // THREE.Vector3 — бақыланатын электрон орны
  anodePulse: 0,
  cathodePulse: 0,
}

const base = {
  running: false,
  progress: 0,
  charge: 0,
  flow: 0,
  stalled: false,
  finished: false,
  saltBridge: true,
  wire: true,
  viewMode: 'macro', // 'macro' | 'micro' (§20)
  showCharges: false, // §23
  cameraMode: 'free', // 'free' | 'focus' | 'follow' (§50)
  focus: 'overview',
  focusNonce: 0,
  followStep: 0,
  selected: null,
  hover: null,
}

// 3D сахна күйі (§45)
export const useSim = create((set, get) => ({
  ...base,
  configure: (p = {}) => {
    live.progress = p.progress ?? 0
    live.charge = 0
    live.flow = 0
    live.trackS = 0
    set({ ...base, viewMode: get().viewMode, ...p })
  },
  start: () => {
    if (get().progress >= 1) {
      live.progress = 0
      set({ progress: 0, finished: false })
    }
    set({ running: true })
  },
  pause: () => set({ running: false }),
  reset: () => {
    live.progress = 0
    live.charge = 0
    live.flow = 0
    live.trackS = 0
    set({ running: false, progress: 0, charge: 0, flow: 0, stalled: false, finished: false })
  },
  setProgress: (v) => {
    live.progress = v
    set({ progress: v, finished: v >= 1 })
  },
  setSaltBridge: (v) => set({ saltBridge: v }),
  setWire: (v) => set({ wire: v }),
  setViewMode: (v) => set({ viewMode: v }),
  toggleCharges: () => set((s) => ({ showCharges: !s.showCharges })),
  setCameraMode: (m) => set({ cameraMode: m }),
  focusOn: (f) => set((s) => ({ focus: f, focusNonce: s.focusNonce + 1, cameraMode: 'focus' })),
  select: (name) => set({ selected: name }),
  setHover: (h) => set({ hover: h }),
}))
