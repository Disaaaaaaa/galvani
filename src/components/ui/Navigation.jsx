import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../../store/useApp'
import { useSim } from '../../store/useSim'
import { play } from '../../lib/sound'
import lessonsData from '../../content/lessons.json'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const loc = useLocation()

  const completed = useApp((s) => s.completed)
  const xp = useApp((s) => s.xp)
  const settings = useApp((s) => s.settings)
  const setSetting = useApp((s) => s.setSetting)
  const resetAll = useApp((s) => s.resetAll)

  const viewMode = useSim((s) => s.viewMode)
  const setViewMode = useSim((s) => s.setViewMode)
  const resetSim = useSim((s) => s.reset)

  useEffect(() => {
    useApp.getState().setLast(loc.pathname)
    setOpen(false)
  }, [loc.pathname])

  const toggleFS = () => {
    play('click')
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setFullscreen(false)
    }
  }

  const curIndex = lessonsData.lessons.findIndex((l) => l.path === loc.pathname)

  return (
    <>
      <header className="topbar">
        <button
          className="btn btn-ghost icon-btn"
          onClick={() => {
            play('click')
            setOpen(true)
          }}
          title="Меню"
          aria-label="Меню"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link to="/" className="brand" title="Басты бетке">
          <div className="brand-dot">e⁻</div>
          <span className="brand-text">ЭЛЕКТРОННЫҢ САЯХАТЫ</span>
        </Link>

        {/* Прогресс картасы (§38) */}
        <nav className="progress-map" aria-label="Сабақдар прогресі">
          {lessonsData.lessons.map((l, i) => {
            if (!l.short) return null
            const isDone = completed.includes(l.id)
            const isCur = loc.pathname === l.path
            return (
              <Link
                key={l.id}
                to={l.path}
                className={`pm-item ${isCur ? 'current' : ''} ${isDone ? 'done' : ''}`}
                title={l.nav}
              >
                <span className="pm-dot" />
                <span>{l.short}</span>
              </Link>
            )
          })}
        </nav>

        <div className="topbar-spacer" />

        <div className="tb-group">
          {/* MICRO / MACRO toggle (§20) */}
          <div className="seg tb-hide-xs" title="Визуалды масштаб (§20)">
            <button
              className={viewMode === 'macro' ? 'on' : ''}
              onClick={() => {
                play('click')
                setViewMode('macro')
              }}
            >
              MACRO
            </button>
            <button
              className={viewMode === 'micro' ? 'on' : ''}
              onClick={() => {
                play('click')
                setViewMode('micro')
              }}
            >
              MICRO
            </button>
          </div>

          <div className="xp-chip" title="Жиналған ұпай (§37)">
            <span>★</span>
            <span>{xp} XP</span>
          </div>

          {/* Дыбыс */}
          <button
            className={`btn btn-ghost icon-btn ${settings.sound ? '' : 'active'}`}
            onClick={() => {
              setSetting('sound', !settings.sound)
              play('click')
            }}
            title={settings.sound ? 'Дыбысты өшіру' : 'Дыбысты қосу'}
            aria-label="Дыбыс"
          >
            {settings.sound ? '🔊' : '🔇'}
          </button>

          {/* Толық экран */}
          <button
            className={`btn btn-ghost icon-btn tb-hide-xs ${fullscreen ? 'active' : ''}`}
            onClick={toggleFS}
            title="Толық экран (F11)"
            aria-label="Толық экран"
          >
            ⛶
          </button>

          {/* Қайта бастау */}
          <button
            className="btn btn-ghost icon-btn"
            onClick={() => {
              play('click')
              resetSim()
            }}
            title="Сахнаны қайта бастау"
            aria-label="Қайта бастау"
          >
            ↻
          </button>
        </div>
      </header>

      {/* Жылжымалы Навигация Менюі (§5) */}
      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} />}
      {open && (
        <aside className="drawer" aria-label="Басты навигация">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" className="brand" onClick={() => setOpen(false)}>
              <div className="brand-dot">e⁻</div>
              <span>ЭЛЕКТРОННЫҢ САЯХАТЫ</span>
            </Link>
            <button className="btn btn-ghost icon-btn" onClick={() => setOpen(false)} aria-label="Жабу">
              ✕
            </button>
          </div>

          <h2 style={{ marginTop: 16 }}>Сабақтар тізімі</h2>
          {lessonsData.lessons.map((l, idx) => {
            const isDone = completed.includes(l.id)
            const isCur = loc.pathname === l.path
            return (
              <Link
                key={l.id}
                to={l.path}
                className={`nav-item ${isCur ? 'active' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="nav-num">{isDone ? '✓' : idx}</span>
                <span>{l.nav}</span>
              </Link>
            )
          })}

          <div className="drawer-section">
            <h2>Баптаулар & Мұғалім режимі</h2>
            <div className="setting-row">
              <span>Дыбыс әсерлері</span>
              <button
                className={`switch ${settings.sound ? 'on' : ''}`}
                onClick={() => setSetting('sound', !settings.sound)}
              />
            </div>
            <div className="setting-row">
              <span>Анимацияны азайту (§59)</span>
              <button
                className={`switch ${settings.reducedMotion ? 'on' : ''}`}
                onClick={() => setSetting('reducedMotion', !settings.reducedMotion)}
              />
            </div>
            <div className="setting-row">
              <span>Барлық белгілерді жасыру (§67)</span>
              <button
                className={`switch ${settings.hideLabels ? 'on' : ''}`}
                onClick={() => setSetting('hideLabels', !settings.hideLabels)}
              />
            </div>
            <div className="setting-row">
              <span>Дидактикалық режим (§49)</span>
              <button
                className={`switch ${settings.learningMode ? 'on' : ''}`}
                onClick={() => setSetting('learningMode', !settings.learningMode)}
              />
            </div>
            <button
              className="btn btn-sm"
              style={{ marginTop: 10, color: 'var(--bad)', borderColor: 'var(--bad-soft)' }}
              onClick={() => {
                if (window.confirm('Барлық прогресті нөлдеуді қалайсыз ба?')) {
                  resetAll()
                  setOpen(false)
                }
              }}
            >
              Прогресті нөлдеу
            </button>
          </div>
        </aside>
      )}
    </>
  )
}
