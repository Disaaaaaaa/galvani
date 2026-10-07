import { useSim } from '../../store/useSim'
import { CELL_INFO } from '../three/GalvanicCell'

/** Pause and Explore кезінде таңдалған/hover болған объект туралы ақпарат карточкасы (§25, §51). */
export default function InfoCard() {
  const selected = useSim((s) => s.selected)
  const hover = useSim((s) => s.hover)
  const select = useSim((s) => s.select)

  const info = hover || (selected ? CELL_INFO[selected] : null)
  if (!info) return null

  return (
    <div className="info-card panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>{info.title || info.name}</h4>
        {selected && (
          <button
            className="btn btn-ghost icon-btn btn-sm"
            onClick={() => select(null)}
            title="Жабу"
          >
            ✕
          </button>
        )}
      </div>
      <p style={{ marginTop: 6 }}>{info.role || info.text}</p>
      {info.roleText && (
        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
          {info.roleText}
        </div>
      )}
    </div>
  )
}
