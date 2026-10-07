import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoundedBox } from '@react-three/drei'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Electron, Label } from '../components/three/common'
import { Table } from '../components/three/cellParts'
import { C } from '../lib/colors'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'
import lessonsData from '../content/lessons.json'

function ZnCuBlocksScene({ selected, onPick }) {
  return (
    <group>
      <Table y={0} size={[10, 6]} />

      {/* Zn металл блогы (§13) */}
      <group
        position={[-1.8, 0.7, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onPick('zn')
        }}
      >
        <RoundedBox args={[1.6, 1.4, 1.4]} radius={0.12} castShadow>
          <meshStandardMaterial
            color={C.znMetal}
            metalness={0.8}
            roughness={0.3}
            emissive={selected === 'zn' ? C.znMetal : '#000'}
            emissiveIntensity={selected === 'zn' ? 0.3 : 0}
          />
        </RoundedBox>
        <Label position={[0, 1.1, 0]} className="lbl big">
          Zn (Мырыш)
        </Label>
      </group>

      {/* Cu металл блогы (§13) */}
      <group
        position={[1.8, 0.7, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onPick('cu')
        }}
      >
        <RoundedBox args={[1.6, 1.4, 1.4]} radius={0.12} castShadow>
          <meshStandardMaterial
            color={C.cuMetal}
            metalness={0.85}
            roughness={0.25}
            emissive={selected === 'cu' ? C.cuMetal : '#000'}
            emissiveIntensity={selected === 'cu' ? 0.3 : 0}
          />
        </RoundedBox>
        <Label position={[0, 1.1, 0]} className="lbl big">
          Cu (Мыс)
        </Label>
      </group>
    </group>
  )
}

export default function ZnCuPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [chosenDir, setChosenDir] = useState(null)
  const navigate = useNavigate()

  const lesson = lessonsData.lessons.find((l) => l.id === 'zncu')
  const complete = useApp((s) => s.complete)

  const handlePick = (m) => {
    play('click')
    setSelected(m)
  }

  const handleChooseDir = (dir) => {
    if (dir === 'zn-cu') {
      play('correct')
      setChosenDir('zn-cu')
    } else {
      play('wrong')
      setChosenDir(dir)
    }
  }

  const handleFinish = () => {
    complete('zncu')
    navigate('/journey')
  }

  return (
    <div className="page">
      <Stage camera={{ position: [0, 3.2, 6.2], fov: 42 }} target={[0, 0.8, 0]}>
        <ZnCuBlocksScene selected={selected} onPick={handlePick} />
      </Stage>

      <LessonDialogue
        eyebrow="7-БӨЛІМ — Zn ЖӘНЕ Cu"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {/* Step 0: Металл қасиеттері (§13) */}
        {stepIdx === 0 && (
          <div className="split" style={{ marginTop: 12 }}>
            <div
              style={{
                background: selected === 'zn' ? 'var(--anode-soft)' : 'var(--bg)',
                borderColor: 'var(--anode)',
                cursor: 'pointer',
              }}
              onClick={() => handlePick('zn')}
            >
              <h4 style={{ color: 'var(--anode)' }}>Zn (Мырыш)</h4>
              <p style={{ margin: 0, fontWeight: 600 }}>«Электрон беруге бейім.»</p>
              <small style={{ display: 'block', marginTop: 4, color: 'var(--muted)' }}>
                Мырыш атомдары оңай тотығады: Zn → Zn²⁺ + 2e⁻
              </small>
            </div>

            <div
              style={{
                background: selected === 'cu' ? 'var(--cathode-soft)' : 'var(--bg)',
                borderColor: 'var(--cathode)',
                cursor: 'pointer',
              }}
              onClick={() => handlePick('cu')}
            >
              <h4 style={{ color: 'var(--cathode)' }}>Cu (Мыс)</h4>
              <p style={{ margin: 0, fontWeight: 600 }}>«Электрон қабылдауға бейім.»</p>
              <small style={{ display: 'block', marginTop: 4, color: 'var(--muted)' }}>
                Мыс иондары тотықсызданады: Cu²⁺ + 2e⁻ → Cu
              </small>
            </div>
          </div>
        )}

        {/* Step 1: Ойын: «Электрон қай металдан қай металлға қозғалады?» (§13) */}
        {stepIdx >= 1 && (
          <div style={{ marginTop: 12 }}>
            <div className="q-text">Ойын: Электрон қай металдан қай металға қозғалады?</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                className={`btn btn-lg ${chosenDir === 'zn-cu' ? 'btn-primary' : ''}`}
                onClick={() => handleChooseDir('zn-cu')}
              >
                Zn → Cu
              </button>
              <button
                className={`btn btn-lg ${chosenDir === 'cu-zn' ? 'q-option wrong' : ''}`}
                onClick={() => handleChooseDir('cu-zn')}
              >
                Cu → Zn
              </button>
            </div>

            {chosenDir && (
              <div className={`feedback ${chosenDir === 'zn-cu' ? 'ok' : 'bad'}`} style={{ marginTop: 10 }}>
                <span>{chosenDir === 'zn-cu' ? '✓' : '✕'}</span>
                <div>
                  <b>{chosenDir === 'zn-cu' ? 'Өте дұрыс!' : 'Қате бағыт.'}</b> Электрон электрон беруге бейім Zn (мырыш) металынан Cu (мыс) металына қарай қозғалады.
                </div>
              </div>
            )}
          </div>
        )}
      </LessonDialogue>
    </div>
  )
}
