import { useEffect } from 'react'
import Stage from '../components/three/Stage'
import GalvanicCell from '../components/three/GalvanicCell'
import SimControls from '../components/ui/SimControls'
import InfoCard from '../components/ui/InfoCard'
import { useSim } from '../store/useSim'
import { play } from '../lib/sound'

export default function VirtualLabPage() {
  const saltBridge = useSim((s) => s.saltBridge)
  const wire = useSim((s) => s.wire)
  const cameraMode = useSim((s) => s.cameraMode)
  const stalled = useSim((s) => s.stalled)

  const setSaltBridge = useSim((s) => s.setSaltBridge)
  const setWire = useSim((s) => s.setWire)
  const setCameraMode = useSim((s) => s.setCameraMode)
  const configure = useSim((s) => s.configure)

  useEffect(() => {
    configure({ saltBridge: true, wire: true, viewMode: 'macro' })
  }, [])

  return (
    <div className="page">
      <Stage camera={{ position: [6.2, 6.2, 9.6], fov: 40 }} target={[0, 2, 0]}>
        <GalvanicCell showRoles={true} showMass={true} showNames={true} />
      </Stage>

      {/* Экранның жоғарғы сол жағындағы еркін режим панелі (§26, §30) */}
      <div className="dialogue panel" style={{ width: 340 }}>
        <div className="eyebrow">11-БӨЛІМ — ВИРТУАЛДЫ ЗЕРТХАНА</div>
        <h2 style={{ fontSize: 18, margin: '4px 0 8px' }}>Еркін зерттеу режимі</h2>
        <p style={{ fontSize: 13, margin: '0 0 10px' }}>
          Бұл жерде шектеу жоқ! Барлық компонентті ажыратып, қосып, электрондар мен иондарды өз бетіңше бақыла.
        </p>

        <div style={{ display: 'grid', gap: 6 }}>
          <button
            className={`btn btn-sm ${wire ? 'active' : ''}`}
            onClick={() => {
              play('snap')
              setWire(!wire)
            }}
          >
            {wire ? '✓ Сыртқы сым: ҚОСЫЛҒАН' : '✕ Сыртқы сым: АЖЫРАТЫЛҒАН (§30)'}
          </button>

          <button
            className={`btn btn-sm ${saltBridge ? 'active' : ''}`}
            onClick={() => {
              play('snap')
              setSaltBridge(!saltBridge)
            }}
          >
            {saltBridge ? '✓ Тұз көпірі: ҚОСЫЛҒАН' : '✕ Тұз көпірі: АЛЫП ТАСТАЛҒАН (§30)'}
          </button>

          <button
            className={`btn btn-sm ${cameraMode === 'follow' ? 'btn-primary' : ''}`}
            onClick={() => setCameraMode(cameraMode === 'follow' ? 'free' : 'follow')}
          >
            {cameraMode === 'follow' ? '🔍 Электроннан шығу' : '👁️ Электронды бақыла'}
          </button>
        </div>

        {/* Қателіктерді бақылау (§30) */}
        {!wire && (
          <div className="feedback bad" style={{ marginTop: 8 }}>
            ⚠️ Сым ажыратылды: электрондар өтетін жол жоқ — ток нөлге айналды.
          </div>
        )}
        {!saltBridge && wire && (
          <div className="feedback hint" style={{ marginTop: 8 }}>
            ⚠️ Тұз көпірі жоқ: иондық заряд бұзылып, реакция тоқтады.
          </div>
        )}
        {wire && saltBridge && (
          <div className="feedback ok" style={{ marginTop: 8 }}>
            ✓ Барлық тізбек тұйық: гальваникалық элемент максималды тиімділікпен жұмыс істеп тұр.
          </div>
        )}
      </div>

      <InfoCard />
      <SimControls />
    </div>
  )
}
