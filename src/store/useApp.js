import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const initial = () => ({
  completed: [], // аяқталған бөлімдер id-лері
  lastLesson: '/',
  xp: 0,
  answers: {}, // { [questionId]: { correct, topic } }
  levelResults: {}, // { easy: { correct, total, byTopic } }
  finalResult: null,
  settings: {
    sound: true,
    reducedMotion: !!prefersReduced,
    speed: 1,
    learningMode: true, // learning / realistic (§49)
    hideLabels: false, // мұғалім режимі (§67)
    narration: true,
  },
})

// Тұрақты сақталатын деректер — localStorage (§38, §64)
export const useApp = create(
  persist(
    (set, get) => ({
      ...initial(),
      complete: (id) =>
        set((s) => (s.completed.includes(id) ? s : { completed: [...s.completed, id] })),
      setLast: (path) => set({ lastLesson: path }),
      // Әр сұраққа тек бірінші жауап есептеледі; дұрыс болса +10 XP (§37)
      record: (id, correct, topic) => {
        const s = get()
        if (s.answers[id]) return false
        set({
          answers: { ...s.answers, [id]: { correct, topic } },
          xp: s.xp + (correct ? 10 : 0),
        })
        return true
      },
      setLevelResult: (level, result) =>
        set((s) => ({ levelResults: { ...s.levelResults, [level]: result } })),
      clearLevel: (ids) =>
        set((s) => {
          const answers = { ...s.answers }
          let xp = s.xp
          ids.forEach((id) => {
            if (answers[id]?.correct) xp -= 10
            delete answers[id]
          })
          return { answers, xp: Math.max(0, xp) }
        }),
      setFinal: (r) => set({ finalResult: r }),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      resetAll: () => set({ ...initial(), settings: get().settings }),
    }),
    { name: 'electron-journey-v1' }
  )
)

export function topicStats(answers) {
  const by = {}
  Object.values(answers).forEach(({ correct, topic }) => {
    if (!topic) return
    by[topic] = by[topic] || { correct: 0, total: 0 }
    by[topic].total += 1
    if (correct) by[topic].correct += 1
  })
  return by
}

export function rating(pct) {
  if (pct >= 90) return 'өте жақсы'
  if (pct >= 70) return 'жақсы'
  if (pct >= 50) return 'орташа'
  return 'қайта қарау ұсынылады'
}
