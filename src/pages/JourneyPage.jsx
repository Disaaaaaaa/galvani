import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/three/Stage'
import GalvanicCell from '../components/three/GalvanicCell'
import LessonDialogue from '../components/ui/LessonDialogue'
import SimControls from '../components/ui/SimControls'
import InfoCard from '../components/ui/InfoCard'
import { useSim } from '../store/useSim'
import { useApp } from '../store/useApp'
import lessonsData from '../content/lessons.json'

const TRACK_STEPS = [
  '1. Zn атомында',
  '2. Электродта',
  '3. Сыртқы сымда',
  '4. Cu электроды жанында',
  '5. Cu²⁺ ионымен әрекеттесуде',
]

export default function JourneyPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const navigate = useNavigate()

  const cameraMode = useSim((s) => s.cameraMode)
  const followStep = useSim((s) => s.followStep)
  const setCameraMode = useSim((s) => s.setCameraMode)
  const focusOn = useSim((s) => s.focusOn)
  const configure = useSim((s) => s.configure)

  const lesson = lessonsData.lessons.find((l) => l.id === 'journey')
  const complete = useApp((s) => s.complete)

  useEffect(() => {
    configure({ saltBridge: true, viewMode: 'macro' })
  }, [])

  // Қадам ауысқанда камераны автоматты фокустау (§50)
  useEffect(() => {
    if (stepIdx === 1) {
      useSim.getState().setViewMode('micro')
      focusOn('zn')
    } else if (stepIdx === 2) {
      setCameraMode('follow')
    } else if (stepIdx === 3) {
      useSim.getState().setViewMode('micro')
      focusOn('cu')
    } else if (stepIdx === 4) {
      focusOn('overview')
    }
  }, [stepIdx])

  const handleFinish = () => {
    complete('journey')
    navigate('/salt-bridge')
  }

  const showRoles = stepIdx >= 4

  return (
    <div className="page">
      <Stage camera={{ position: [6.2, 6.2, 9.6], fov: 40 }} target={[0, 2, 0]}>
        <GalvanicCell
          showRoles={showRoles}
          showMass={true}
          showNames={true}
        />
      </Stage>

      <LessonDialogue
        eyebrow="9-БӨЛІМ — ЭЛЕКТРОННЫҢ САЯХАТЫ"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {/* Бақылау батырмасы (§27) */}
        <div style={{ marginTop: 10 }}>
          <button
            className={`btn btn-sm ${cameraMode === 'follow' ? 'btn-primary' : ''}`}
            onClick={() => setCameraMode(cameraMode === 'follow' ? 'free' : 'follow')}
            title="Камераны бір электронға құлыптау (§27)"
          >
            {cameraMode === 'follow' ? '🔍 Электроннан шығу' : '👁️ Электронды бақыла'}
          </button>
        </div>
      </LessonDialogue>

      {/* Оң жақ экрандағы электрон саяхатының статусы (§27) */}
      <div className="side-tools">
        <div className="tool-card panel track-status">
          <h3>Электрон саяхаты</h3>
          <ol>
            {TRACK_STEPS.map((st, i) => {
              const cur = cameraMode === 'follow' ? followStep : -1
              const isOn = cur === i
              const isPast = cur > i
              return (
                <li key={i} className={`${isOn ? 'on' : ''} ${isPast ? 'past' : ''}`}>
                  <span className="n">{i + 1}</span>
                  <span>{st.substring(3)}</span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <InfoCard />
      <SimControls />
    </div>
  )
}
