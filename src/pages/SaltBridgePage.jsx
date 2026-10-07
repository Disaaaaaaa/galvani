import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/three/Stage'
import GalvanicCell from '../components/three/GalvanicCell'
import LessonDialogue from '../components/ui/LessonDialogue'
import SimControls from '../components/ui/SimControls'
import { useSim } from '../store/useSim'
import { useApp } from '../store/useApp'
import { play } from '../lib/sound'
import lessonsData from '../content/lessons.json'

export default function SaltBridgePage() {
  const [stepIdx, setStepIdx] = useState(0)
  const navigate = useNavigate()

  const saltBridge = useSim((s) => s.saltBridge)
  const stalled = useSim((s) => s.stalled)
  const configure = useSim((s) => s.configure)
  const setSaltBridge = useSim((s) => s.setSaltBridge)
  const startSim = useSim((s) => s.start)

  const lesson = lessonsData.lessons.find((l) => l.id === 'bridge')
  const complete = useApp((s) => s.complete)

  useEffect(() => {
    configure({ saltBridge: false, showCharges: true, viewMode: 'micro' })
    startSim()
  }, [])

  useEffect(() => {
    if (stepIdx === 2 && !saltBridge) {
      // Тұз көпірін қосқызу (§21)
    }
  }, [stepIdx])

  const handleToggleBridge = () => {
    play('snap')
    setSaltBridge(true)
    startSim()
  }

  const handleFinish = () => {
    complete('bridge')
    navigate('/lab')
  }

  return (
    <div className="page">
      <Stage camera={{ position: [0, 4.4, 7.8], fov: 40 }} target={[0, 2, 0]}>
        <GalvanicCell
          showRoles={true}
          showMass={true}
          forceBridgeIons={true}
          highlight={!saltBridge && stepIdx >= 1 ? 'bridge' : null}
        />
      </Stage>

      <LessonDialogue
        eyebrow="10-БӨЛІМ — ТҰЗ КӨПІРІ НЕ ҮШІН ҚАЖЕТ?"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {/* Тұз көпірі жоқ кездегі тоқтау ескертуі (§21) */}
        {!saltBridge && (
          <div className="callout warn" style={{ marginTop: 10 }}>
            ⚠️ <b>Реакция тоқтады!</b> Анод жағында оң заряд (Zn²⁺) жиналып, электрондарды жібермей тұр.
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: 8 }}
              onClick={handleToggleBridge}
            >
              🌉 Тұз көпірін орнату
            </button>
          </div>
        )}

        {saltBridge && (
          <div className="feedback ok" style={{ marginTop: 10 }}>
            ✓ Тұз көпірі орнатылды! Иондар (K⁺, NO₃⁻) жылжып, зарядтар теңесті. Электрондар қайта жүрді.
          </div>
        )}

        {/* Иондар мен электрондарды салыстыру карточкасы (§22) */}
        <div className="compare panel" style={{ marginTop: 12, padding: 12 }}>
          <div style={{ color: '#0284c7' }}>
            <span className="legend-dot" style={{ background: 'var(--electron)' }} />
            <span>Электрондар → тек сыртқы сым арқылы</span>
          </div>
          <div style={{ color: '#d97706' }}>
            <span className="legend-dot" style={{ background: 'var(--cation)' }} />
            <span>K⁺ Катиондар → тұз көпірімен катодқа</span>
          </div>
          <div style={{ color: '#16a34a' }}>
            <span className="legend-oct" style={{ background: 'var(--anion)' }} />
            <span>NO₃⁻ Аниондар → тұз көпірімен анодқа</span>
          </div>
        </div>
      </LessonDialogue>

      <SimControls showBridgeToggle={true} showChargeToggle={true} />
    </div>
  )
}
