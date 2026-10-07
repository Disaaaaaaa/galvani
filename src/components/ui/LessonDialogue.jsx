import { useState } from 'react'
import { play } from '../../lib/sound'

/**
 * Сабақ барысындағы негізгі диалог / нұсқаулық карточкасы.
 * Педагогикалық қағида (§74): Алдымен құбылысты көрсетеді → кейін түсіндіреді → соңында термин береді.
 */
export default function LessonDialogue({
  eyebrow = 'ОҚЫТУ СЦЕНАРИЙІ',
  steps = [],
  stepIndex = 0,
  onStepChange,
  children,
  onFinish,
  nextLabel = 'Келесі қадам',
  finishLabel = 'Аяқтау',
}) {
  const [collapsed, setCollapsed] = useState(false)
  const step = steps[stepIndex] || {}

  const goPrev = () => {
    play('click')
    if (stepIndex > 0) onStepChange?.(stepIndex - 1)
  }

  const goNext = () => {
    play('click')
    if (stepIndex < steps.length - 1) {
      onStepChange?.(stepIndex + 1)
    } else {
      onFinish?.()
    }
  }

  return (
    <div className={`dialogue panel ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="btn btn-ghost icon-btn collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Жазуды ашу' : 'Жазуды жинау'}
      >
        {collapsed ? '▲' : '▼'}
      </button>

      <div className="eyebrow">{eyebrow}</div>
      {step.title && <h2>{step.title}</h2>}
      {step.text && <p>{step.text}</p>}

      {children}

      <div className="dialogue-foot">
        {steps.length > 1 && (
          <div className="step-dots">
            {steps.map((_, i) => (
              <span
                key={i}
                className={i === stepIndex ? 'on' : i < stepIndex ? 'past' : ''}
                onClick={() => {
                  play('click')
                  onStepChange?.(i)
                }}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        )}

        {stepIndex > 0 && (
          <button className="btn btn-sm" onClick={goPrev}>
            ← Артқа
          </button>
        )}

        {steps.length > 0 && (
          <button className="btn btn-primary btn-sm" onClick={goNext}>
            {stepIndex < steps.length - 1 ? nextLabel : finishLabel} →
          </button>
        )}
      </div>
    </div>
  )
}
