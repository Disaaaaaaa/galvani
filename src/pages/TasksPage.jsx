import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/three/Stage'
import GalvanicCell from '../components/three/GalvanicCell'
import QuestionView from '../components/ui/QuestionView'
import { AtomScene } from './ElectronPage'
import { play } from '../lib/sound'
import { useApp, topicStats, rating } from '../store/useApp'
import tasksData from '../content/tasks.json'
import lessonsData from '../content/lessons.json'

export default function TasksPage() {
  const [activeLevel, setActiveLevel] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [picked3DTarget, setPicked3DTarget] = useState(null)
  const [labelState, setLabelState] = useState({})
  const [labelSubmitted, setLabelSubmitted] = useState(false)

  const navigate = useNavigate()
  const answers = useApp((s) => s.answers)
  const xp = useApp((s) => s.xp)
  const record = useApp((s) => s.record)
  const complete = useApp((s) => s.complete)

  const levelObj = tasksData.levels.find((l) => l.id === activeLevel)
  const currentQ = levelObj?.questions?.[qIndex]

  const handlePick3D = (name) => {
    if (!currentQ || currentQ.type !== 'pick') return
    setPicked3DTarget(name)
    const isRight = name === currentQ.target
    if (isRight) play('correct')
    else play('wrong')
    record(currentQ.id, isRight, currentQ.topic)
  }

  const handleLabelDrop = (chip, targetZone) => {
    play('snap')
    setLabelState((prev) => ({ ...prev, [targetZone]: chip }))
  }

  const checkLabelPuzzle = () => {
    const correctMap = {
      z1: 'anode',
      z2: 'cathode',
      z3: 'eDir',
      z4: 'ionDir',
      z5: 'oxidation',
      z6: 'reduction',
    }
    let okCount = 0
    Object.keys(correctMap).forEach((z) => {
      if (labelState[z] === correctMap[z]) okCount++
    })
    const isFullOk = okCount >= 5
    if (isFullOk) play('correct')
    else play('wrong')
    setLabelSubmitted(true)
    record('a1', isFullOk, 'electrodes')
  }

  const handleNextQ = () => {
    play('click')
    setPicked3DTarget(null)
    if (qIndex < levelObj.questions.length - 1) {
      setQIndex(qIndex + 1)
    } else {
      complete('tasks')
      setActiveLevel('results')
    }
  }

  const stats = topicStats(answers)

  return (
    <div className="page">
      {/* 3D Фон сұрақтар үшін */}
      <Stage camera={{ position: [0, 4.2, 7.5], fov: 42 }} target={[0, 1.8, 0]}>
        {currentQ?.scene === 'atom' ? (
          <AtomScene mode="atom" onPickElectron={() => handlePick3D('electron')} />
        ) : (
          <GalvanicCell
            onPick={handlePick3D}
            showRoles={false}
            showNames={false}
            highlight={
              currentQ?.type === 'pick'
                ? picked3DTarget || currentQ.target
                : null
            }
          />
        )}
      </Stage>

      {/* 1. Деңгей таңдау экраны (§33) */}
      {!activeLevel && (
        <div className="board-wrap">
          <div className="board panel" style={{ maxWidth: 840 }}>
            <div className="board-head">
              <div className="eyebrow">10-БӨЛІМ — ТАПСЫРМАЛАР ЖӘНЕ ТЕСТ</div>
              <h1>Біліміңді тексер</h1>
              <p>Үш деңгейдің бірін таңдап, тапсырмаларды орында. Әр дұрыс жауап үшін +10 XP беріледі.</p>
            </div>

            <div className="grid-cards" style={{ padding: 20 }}>
              {tasksData.levels.map((lvl) => (
                <button
                  key={lvl.id}
                  className="level-card panel"
                  onClick={() => {
                    play('click')
                    setActiveLevel(lvl.id)
                    setQIndex(0)
                  }}
                >
                  <span className="badge">
                    {lvl.questions.length} тапсырма
                  </span>
                  <h3>{lvl.title}</h3>
                  <p>{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Сұрақтарды орындау экраны (§34–§36) */}
      {activeLevel && activeLevel !== 'results' && currentQ && (
        <div className="dialogue panel" style={{ width: 440 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow">
              {levelObj.title} ДЕҢГЕЙ ({qIndex + 1}/{levelObj.questions.length})
            </div>
            <button
              className="btn btn-ghost icon-btn btn-sm"
              onClick={() => setActiveLevel(null)}
            >
              ✕
            </button>
          </div>

          {/* 3D таңдау сұрағы немесе Тікелей Сұрақ */}
          {currentQ.type === 'label' ? (
            <div style={{ marginTop: 10 }}>
              <div className="q-text">{currentQ.q}</div>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Схемадағы аймақтарға сәйкес белгілерді таңдап қой.
              </p>

              {/* Белгілер тізімі (§36, §69) */}
              <div className="chips">
                {[
                  { id: 'anode', name: 'АНОД', color: 'var(--anode)' },
                  { id: 'cathode', name: 'КАТОД', color: 'var(--cathode)' },
                  { id: 'eDir', name: 'e⁻ бағыты', color: 'var(--electron)' },
                  { id: 'ionDir', name: 'Иондар бағыты', color: 'var(--cation)' },
                  { id: 'oxidation', name: 'Тотығу', color: 'var(--anode)' },
                  { id: 'reduction', name: 'Тотықсыздану', color: 'var(--cathode)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    className="lchip"
                    style={{ background: item.color }}
                    onClick={() => handleLabelDrop(item.id, `z${Object.keys(labelState).length + 1}`)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {labelSubmitted && (
                <div className="feedback ok" style={{ marginTop: 10 }}>
                  ✓ Схема тексерілді! Нәтижені қараңыз.
                </div>
              )}

              {!labelSubmitted && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: 10 }}
                  onClick={checkLabelPuzzle}
                >
                  ⚡ Тексеру
                </button>
              )}
            </div>
          ) : (
            <QuestionView question={currentQ} onAnswer={() => {}} />
          )}

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={handleNextQ}>
              {qIndex < levelObj.questions.length - 1 ? 'Келесі сұрақ →' : 'Нәтижені көру →'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Нәтижелер экраны (§37) */}
      {activeLevel === 'results' && (
        <div className="board-wrap">
          <div className="board panel results" style={{ maxWidth: 680 }}>
            <div className="eyebrow">ТАПСЫРМА НӘТИЖЕЛЕРІ</div>
            <h2>Сынақ Аяқталды!</h2>
            <div className="big-pct">★ {xp} XP</div>

            <div style={{ marginTop: 16 }}>
              <h3>Тақырыптар бойынша нәтиже:</h3>
              {Object.entries(tasksData.topics).map(([topKey, topTitle]) => {
                const st = stats[topKey] || { correct: 0, total: 1 }
                const pct = Math.round((st.correct / Math.max(1, st.total)) * 100)
                const rat = rating(pct)
                return (
                  <div key={topKey} className="bar-row">
                    <div>{topTitle}</div>
                    <div className="bar">
                      <i style={{ width: `${pct}%` }} />
                    </div>
                    <div className="pct">{pct}%</div>
                    <div className="rating">{rat}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setActiveLevel(null)
                  setQIndex(0)
                }}
              >
                🔄 Қайта өту
              </button>
              <button className="btn" onClick={() => navigate('/summary')}>
                🏁 Қорытынды бетке өту →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
