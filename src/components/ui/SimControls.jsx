import { useSim } from '../../store/useSim'
import { useApp } from '../../store/useApp'
import { play } from '../../lib/sound'

export default function SimControls({
  showSpeed = true,
  showSlider = true,
  showBridgeToggle = true,
  showChargeToggle = true,
  showCameraModes = true,
}) {
  const running = useSim((s) => s.running)
  const progress = useSim((s) => s.progress)
  const saltBridge = useSim((s) => s.saltBridge)
  const showCharges = useSim((s) => s.showCharges)
  const cameraMode = useSim((s) => s.cameraMode)
  const focus = useSim((s) => s.focus)

  const start = useSim((s) => s.start)
  const pause = useSim((s) => s.pause)
  const reset = useSim((s) => s.reset)
  const setProgress = useSim((s) => s.setProgress)
  const setSaltBridge = useSim((s) => s.setSaltBridge)
  const toggleCharges = useSim((s) => s.toggleCharges)
  const setCameraMode = useSim((s) => s.setCameraMode)
  const focusOn = useSim((s) => s.focusOn)

  const speed = useApp((s) => s.settings.speed)
  const setSetting = useApp((s) => s.setSetting)

  const toggleRun = () => {
    play('click')
    if (running) pause()
    else start()
  }

  return (
    <div className="controls panel">
      <button
        className={`btn ${running ? 'btn-dark' : 'btn-primary'}`}
        onClick={toggleRun}
        title={running ? 'Тоқтату (⏸)' : 'Бастау (▶)'}
      >
        {running ? '⏸ Тоқтату' : '▶ Бастау'}
      </button>

      <button
        className="btn icon-btn"
        onClick={() => {
          play('click')
          reset()
        }}
        title="Қайта бастау (↻)"
      >
        ↻
      </button>

      {showSpeed && (
        <div className="seg" title="Анимация жылдамдығы (§15)">
          {[0.5, 1, 2].map((sp) => (
            <button
              key={sp}
              className={speed === sp ? 'on' : ''}
              onClick={() => {
                play('click')
                setSetting('speed', sp)
              }}
            >
              ×{sp}
            </button>
          ))}
        </div>
      )}

      {showSlider && (
        <>
          <div className="divider" />
          <div className="slider-wrap" title="Реакция уақыты (§24)">
            <span>Реакция</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              style={{ '--p': `${Math.round(progress * 100)}%` }}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
            />
            <span className="val">{Math.round(progress * 100)}%</span>
          </div>
        </>
      )}

      {(showBridgeToggle || showChargeToggle || showCameraModes) && <div className="divider" />}

      {showBridgeToggle && (
        <button
          className={`btn btn-sm ${saltBridge ? 'active' : ''}`}
          onClick={() => {
            play('click')
            setSaltBridge(!saltBridge)
          }}
          title="Тұз көпірін қосу/өшіру (§21)"
        >
          {saltBridge ? '✓ Тұз көпірі' : '✕ Тұз көпірі жоқ'}
        </button>
      )}

      {showChargeToggle && (
        <button
          className={`btn btn-sm ${showCharges ? 'active' : ''}`}
          onClick={() => {
            play('click')
            toggleCharges()
          }}
          title="Зарядтар балансын көрсету (§23)"
        >
          {showCharges ? '⚡ Зарядтар: КОРСЕТІЛГЕН' : '⚡ Зарядтар'}
        </button>
      )}

      {showCameraModes && (
        <div className="seg" title="Камера режимі (§50)">
          <button
            className={cameraMode === 'free' ? 'on' : ''}
            onClick={() => {
              play('click')
              setCameraMode('free')
            }}
          >
            FREE
          </button>
          <button
            className={cameraMode === 'focus' ? 'on' : ''}
            onClick={() => {
              play('click')
              focusOn(focus || 'overview')
            }}
          >
            FOCUS
          </button>
          <button
            className={cameraMode === 'follow' ? 'on' : ''}
            onClick={() => {
              play('click')
              setCameraMode('follow')
            }}
          >
            FOLLOW e⁻
          </button>
        </div>
      )}
    </div>
  )
}
