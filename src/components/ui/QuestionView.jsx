import { useState } from 'react'
import { play } from '../../lib/sound'
import { useApp } from '../../store/useApp'

/**
 * Интерактивті сұрақ компоненті (§62, §63).
 * Сұрақ механикасы:
 * - Бірінші қате: қысқа нұсқау.
 * - Екінші қате: күшті hint.
 * - Үшінші қате: визуалды hint (дұрыс жауап жыпылықтайды).
 * - Содан кейін ғана жауап ашылады.
 */
export default function QuestionView({ question, onAnswer }) {
  const [fails, setFails] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [answered, setAnswered] = useState(false)

  const record = useApp((s) => s.record)
  const recorded = useApp((s) => s.answers[question.id])

  const handlePick = (idx) => {
    if (answered || recorded) return
    setSelectedOpt(idx)
    const isCorrect = idx === question.answer
    if (isCorrect) {
      play('correct')
      setAnswered(true)
      record(question.id, true, question.topic)
      onAnswer?.(true)
    } else {
      play('wrong')
      const n = fails + 1
      setFails(n)
      if (n >= 3) {
        setAnswered(true)
        record(question.id, false, question.topic)
        onAnswer?.(false)
      }
    }
  }

  if (!question || question.type === 'label') return null

  const isPick = question.type === 'pick'
  const isDone = answered || !!recorded
  const isRight = isDone && (selectedOpt === question.answer || recorded?.correct)
  const showGlow = fails >= 2 && !isDone

  return (
    <div className="question">
      <div className="q-text">{question.q}</div>

      {!isPick && question.options && (
        <div className="q-options">
          {question.options.map((opt, i) => {
            let cls = 'q-option'
            if (isDone) {
              if (i === question.answer) cls += ' correct'
              else if (i === selectedOpt) cls += ' wrong'
            } else {
              if (showGlow && i === question.answer) cls += ' glow'
            }
            return (
              <button key={i} className={cls} disabled={isDone} onClick={() => handlePick(i)}>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Нұсқаулық & Hint жүйесі (§62, §63) */}
      {fails > 0 && !isDone && (
        <div className="feedback hint">
          <span>💡</span>
          <div>
            <b>Көмек ({fails}/3):</b> {question.hints?.[fails - 1] || 'Қайтадан байқап көр.'}
          </div>
        </div>
      )}

      {isDone && (
        <div className={`feedback ${isRight ? 'ok' : 'bad'}`}>
          <span>{isRight ? '✓' : '✕'}</span>
          <div>
            <b>{isRight ? 'Дұрыс!' : 'Қате.'}</b>{' '}
            {isRight
              ? 'Тамаша жауап.'
              : `Дұрыс жауап: ${question.options?.[question.answer] || 'Нұсқауды қараңыз.'}`}
          </div>
          {isRight && <div className="xp-pop">+10 XP</div>}
        </div>
      )}
    </div>
  )
}
