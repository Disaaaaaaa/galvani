import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/three/Stage'
import GalvanicCell from '../components/three/GalvanicCell'
import SimControls from '../components/ui/SimControls'
import { play } from '../lib/sound'
import { useApp, topicStats } from '../store/useApp'

export default function SummaryPage() {
  const [tab, setTab] = useState('summary') // 'summary' | 'puzzle' | 'results'
  const [puzzleDone, setPuzzleDone] = useState(false)
  const navigate = useNavigate()

  const completed = useApp((s) => s.completed)
  const xp = useApp((s) => s.xp)
  const answers = useApp((s) => s.answers)

  const stats = topicStats(answers)
  const overallPct = Math.min(100, Math.round((completed.length / 9) * 60 + (xp / 100) * 40))

  return (
    <div className="page">
      <Stage camera={{ position: [6.2, 6.2, 9.6], fov: 40 }} target={[0, 2, 0]}>
        <GalvanicCell showRoles={true} showMass={true} showNames={true} />
      </Stage>

      {/* Жоғарғы вкладкалар (§68, §69, §70) */}
      <div className="tabs panel">
        <button className={tab === 'summary' ? 'on' : ''} onClick={() => setTab('summary')}>
          📖 Негізгі қорытынды
        </button>
        <button className={tab === 'puzzle' ? 'on' : ''} onClick={() => setTab('puzzle')}>
          🧩 Финалдық схема
        </button>
        <button className={tab === 'results' ? 'on' : ''} onClick={() => setTab('results')}>
          🏆 Саяхат нәтижесі
        </button>
      </div>

      {/* 1. Негізгі қорытынды (§68) */}
      {tab === 'summary' && (
        <div className="dialogue panel" style={{ width: 440 }}>
          <div className="eyebrow">11-БӨЛІМ — ҚОРЫТЫНДЫ</div>
          <h2 style={{ fontSize: 18, margin: '4px 0 8px' }}>Гальваникалық элементтің негізгі формуласы</h2>

          <div className="summary-flow">
            <div className="sf-col" style={{ background: 'var(--anode-soft)', color: 'var(--anode)' }}>
              <span>Zn атомы</span>
              <span className="ar">↓</span>
              <span>электрон береді</span>
              <span className="ar">↓</span>
              <span>тотығу</span>
              <span className="ar">↓</span>
              <b>АНОД (−)</b>
            </div>

            <div className="sf-col" style={{ background: 'var(--electron-soft)', color: '#0369a1' }}>
              <span>e⁻ электрондар</span>
              <span className="ar">↓</span>
              <span>сыртқы тізбекпен</span>
              <span className="ar">↓</span>
              <span>ток береді</span>
              <span className="ar">↓</span>
              <b>1.10 Volt</b>
            </div>

            <div className="sf-col" style={{ background: 'var(--cathode-soft)', color: 'var(--cathode)' }}>
              <span>Cu²⁺ ионы</span>
              <span className="ar">↓</span>
              <span>электрон алады</span>
              <span className="ar">↓</span>
              <span>тотықсыздану</span>
              <span className="ar">↓</span>
              <b>КАТОД (+)</b>
            </div>
          </div>

          <div className="callout" style={{ marginTop: 10, fontSize: 13 }}>
            💡 <b>Тұз көпірі:</b> иондарды (K⁺, NO₃⁻) жылжытып, екі ыдыстағы зарядты теңестіреді.
          </div>
        </div>
      )}

      {/* 2. Финалдық интерактивті схема (§69) */}
      {tab === 'puzzle' && (
        <div className="dialogue panel" style={{ width: 440 }}>
          <div className="eyebrow">ФИНАЛДЫҚ ИНТЕРАКТИВ</div>
          <h2 style={{ fontSize: 18, margin: '4px 0 8px' }}>Белгілерді орналастыр</h2>
          <p style={{ fontSize: 13, margin: '0 0 8px' }}>
            3D модельде анод пен катодты, электрондар мен иондардың қозғалысын көрсет.
          </p>

          <div className="chips">
            {['ANODE', 'CATHODE', 'Zn²⁺', 'Cu²⁺', 'e⁻', 'Oxidation', 'Reduction', 'Salt bridge'].map((chip, i) => (
              <button key={i} className="lchip light" onClick={() => play('snap')}>
                {chip}
              </button>
            ))}
          </div>

          {!puzzleDone && (
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                play('correct')
                setPuzzleDone(true)
              }}
            >
              ⚡ Тексеру
            </button>
          )}

          {puzzleDone && (
            <div className="feedback ok" style={{ marginTop: 10 }}>
              🎉 Өте тамаша! Барлық 8 белгі дұрыс орналастырылды.
            </div>
          )}
        </div>
      )}

      {/* 3. Финалдық нәтиже экраны (§70) */}
      {tab === 'results' && (
        <div className="board-wrap">
          <div className="board panel results" style={{ maxWidth: 640 }}>
            <div className="eyebrow">САЯХАТ АЯҚТАЛДЫ</div>
            <h1>Құттықтаймыз! 🎉</h1>
            <div className="big-pct">{overallPct}%</div>

            <div style={{ marginTop: 16 }}>
              <div className="bar-row">
                <div>Электрон қозғалысы</div>
                <div className="bar"><i style={{ width: '100%' }} /></div>
                <div className="pct">100%</div>
              </div>
              <div className="bar-row">
                <div>Анод және катод</div>
                <div className="bar"><i style={{ width: '90%' }} /></div>
                <div className="pct">90%</div>
              </div>
              <div className="bar-row">
                <div>Тұз көпірі</div>
                <div className="bar"><i style={{ width: '85%' }} /></div>
                <div className="pct">85%</div>
              </div>
              <div className="bar-row">
                <div>Энергия түрленуі</div>
                <div className="bar"><i style={{ width: '100%' }} /></div>
                <div className="pct">100%</div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/journey')}>
                🔄 Қайта өту
              </button>
              <button className="btn" onClick={() => navigate('/lab')}>
                🧪 Зертханаға оралу
              </button>
            </div>
          </div>
        </div>
      )}

      <SimControls />
    </div>
  )
}
