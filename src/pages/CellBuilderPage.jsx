import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Table, Beaker, Solution, Electrode, Wire, SaltBridge, Voltmeter } from '../components/three/cellParts'
import { C } from '../lib/colors'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'

const REQ_PARTS = [
  { id: 'beakers', name: '2 Ыдыс', icon: '🥛' },
  { id: 'znsol', name: 'Zn ерітіндісі', icon: '🧪' },
  { id: 'cusol', name: 'Cu ерітіндісі', icon: '🔵' },
  { id: 'zn', name: 'Zn электроды', icon: '◽' },
  { id: 'cu', name: 'Cu электроды', icon: '🟧' },
  { id: 'wire', name: 'Өткізгіш сым', icon: '🔌' },
  { id: 'bridge', name: 'Тұз көпірі', icon: '🌉' },
  { id: 'voltmeter', name: 'Вольтметр', icon: '📟' },
]

function LabBuilderScene({ placed }) {
  return (
    <group>
      <Table y={0} size={[12, 7]} />

      {/* Орындардың 3D модельдері (жиналған сайын шығады) */}
      {placed.beakers && (
        <>
          <Beaker x={-2.2} />
          <Beaker x={2.2} />
        </>
      )}

      {placed.znsol && placed.beakers && <Solution x={-2.2} color={C.znSolution} opacity={0.5} interactive={false} />}
      {placed.cusol && placed.beakers && <Solution x={2.2} color={C.cuSolution} opacity={0.5} interactive={false} />}
      {placed.zn && placed.beakers && <Electrode metal="zn" x={-2.2} interactive={false} />}
      {placed.cu && placed.beakers && <Electrode metal="cu" x={2.2} interactive={false} />}
      {placed.wire && <Wire interactive={false} />}
      {placed.bridge && placed.beakers && <SaltBridge interactive={false} />}
      {placed.voltmeter && <Voltmeter reading={placed.wire && placed.bridge ? '1.10' : '0.00'} interactive={false} />}
    </group>
  )
}

export default function CellBuilderPage() {
  const [placed, setPlaced] = useState({})
  const [showHint, setShowHint] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const complete = useApp((s) => s.complete)

  const handlePlacePart = (partId) => {
    play('snap')
    setErrorMsg(null)

    // Тәуелділік тексерісі (§14, §29)
    if (['znsol', 'cusol', 'zn', 'cu', 'bridge'].includes(partId) && !placed.beakers) {
      play('wrong')
      setErrorMsg('Алдымен екі ыдысты үстелге қою керек!')
      return
    }

    setPlaced((prev) => ({ ...prev, [partId]: true }))
  }

  const handleStartSystem = () => {
    const isFull = REQ_PARTS.every((p) => placed[p.id])
    if (isFull) {
      play('correct')
      setSuccess(true)
      complete('zncu')
    } else {
      play('wrong')
      setErrorMsg('Тізбек толық емес — құрылғы жұмыс істемейді. Барлық бөлшекті орналастыр!')
    }
  }

  return (
    <div className="page">
      <Stage camera={{ position: [0, 5.2, 8.5], fov: 42 }} target={[0, 1.6, 0]}>
        <LabBuilderScene placed={placed} />
      </Stage>

      <LessonDialogue
        eyebrow="8-БӨЛІМ — ӨЗ БЕТІҢМЕН ЖИНАУ"
        steps={[
          {
            title: 'Гальваникалық элементті құрастыр',
            text: 'Төмендегі лотоктан бөлшектерді ретімен басып, жұмыс үстеліне орналастыр. Тізбек дайын болғанда «Жүйені іске қос» түймесін бас.',
          },
        ]}
        stepIndex={0}
        onStepChange={() => {}}
        onFinish={() => navigate('/journey')}
        finishLabel="Саяхатқа өту"
      >
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm"
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? 'Нұсқауды жасу' : 'Нұсқау көрсету'}
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setPlaced({})
                setErrorMsg(null)
                setSuccess(false)
              }}
            >
              ↻ Тазалау
            </button>
          </div>

          {showHint && (
            <div className="callout warn" style={{ marginTop: 8 }}>
              <b>Дұрыс рет:</b> 1. Ыдыстар → 2. Ерітінділер → 3. Электродтар → 4. Сыртқы сым → 5. Тұз көпірі → 6. Вольтметр.
            </div>
          )}

          {/* Жинақ чек-парағы */}
          <ul className="checklist" style={{ marginTop: 8 }}>
            {REQ_PARTS.map((p) => (
              <li key={p.id}>
                <span className={`ck ${placed[p.id] ? 'y' : 'n'}`}>
                  {placed[p.id] ? '✓' : '○'}
                </span>
                <span>
                  {p.icon} {p.name}
                </span>
              </li>
            ))}
          </ul>

          {errorMsg && (
            <div className="feedback bad" style={{ marginTop: 8 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {success && (
            <div className="feedback ok" style={{ marginTop: 8 }}>
              🎉 Тамаша! Тізбек сәтті құрастырылды. Вольтметр 1.10 В көрсетеді!
            </div>
          )}

          <button
            className={`btn btn-lg ${success ? 'btn-dark' : 'btn-primary'}`}
            style={{ width: '100%', marginTop: 10 }}
            onClick={handleStartSystem}
          >
            {success ? '✓ Жүйе жұмыс істеп тұр!' : '⚡ Жүйені іске қос'}
          </button>
        </div>
      </LessonDialogue>

      {/* Төменгі құралдар науасы (Tray, §14) */}
      <div className="tray panel">
        {REQ_PARTS.map((p) => {
          const isPlaced = placed[p.id]
          return (
            <button
              key={p.id}
              className={`tray-item ${isPlaced ? 'used' : ''}`}
              onClick={() => handlePlacePart(p.id)}
              disabled={isPlaced}
            >
              <div className="tray-icon">{p.icon}</div>
              <span>{p.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
