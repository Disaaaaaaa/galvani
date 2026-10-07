import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Electron, Label } from '../components/three/common'
import { C } from '../lib/colors'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'
import lessonsData from '../content/lessons.json'

export function AtomScene({ mode = 'atom', onPickElectron }) {
  const nucGroup = useRef()
  const eOrbit = useRef()
  const wireGroup = useRef()

  // Кездейсоқ немесе бағытталған қозғалыс (§9)
  const N = 24
  const particles = useMemo(() => {
    return Array.from({ length: N }, (_, i) => ({
      x: (i - N / 2) * 0.35,
      y: (Math.random() - 0.5) * 0.6,
      z: (Math.random() - 0.5) * 0.6,
      vx: Math.random() - 0.5,
      vy: Math.random() - 0.5,
    }))
  }, [N])

  const wireE = useRef(particles)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (nucGroup.current) nucGroup.current.rotation.y = t * 0.5
    if (eOrbit.current) eOrbit.current.rotation.y = t * 1.8

    if (mode === 'random') {
      wireE.current.forEach((p) => {
        p.x += p.vx * dt * 0.8
        p.y += p.vy * dt * 0.8
        if (Math.abs(p.x) > 3.5) p.vx *= -1
        if (Math.abs(p.y) > 0.6) p.vy *= -1
      })
    } else if (mode === 'directed') {
      wireE.current.forEach((p) => {
        p.x += dt * 2.2
        if (p.x > 3.8) p.x = -3.8
      })
    }
    if (wireGroup.current) wireGroup.current.rotation.x = 0
  })

  return (
    <group>
      {mode === 'atom' && (
        <group position={[0, 1.2, 0]}>
          {/* Атом ядросы (протондар мен нейтрондар) */}
          <group ref={nucGroup}>
            {[
              [0, 0, 0],
              [0.15, 0.1, -0.1],
              [-0.12, -0.12, 0.1],
              [0.1, -0.15, 0.12],
              [-0.15, 0.12, -0.1],
              [0.05, 0.18, 0.15],
            ].map((pos, i) => (
              <mesh key={i} position={pos}>
                <sphereGeometry args={[0.18, 20, 20]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? '#ef4444' : '#94a3b8'}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>

          {/* Электрондық орбитальдар */}
          <group ref={eOrbit}>
            {/* 1-орбита */}
            <mesh rotation-x={Math.PI / 3}>
              <torusGeometry args={[1.5, 0.012, 16, 64]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
            <Electron
              position={[1.5, 0, 0]}
              radius={0.09}
              onClick={(e) => {
                e.stopPropagation()
                onPickElectron()
              }}
            />

            {/* 2-орбита */}
            <mesh rotation-x={-Math.PI / 3}>
              <torusGeometry args={[2.2, 0.012, 16, 64]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
            <Electron
              position={[-2.2, 0, 0]}
              radius={0.09}
              onClick={(e) => {
                e.stopPropagation()
                onPickElectron()
              }}
            />

            {/* 3-орбита */}
            <mesh rotation-y={Math.PI / 2}>
              <torusGeometry args={[2.8, 0.012, 16, 64]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
            <Electron
              position={[0, 2.8, 0]}
              radius={0.09}
              onClick={(e) => {
                e.stopPropagation()
                onPickElectron()
              }}
            />
          </group>

          <Label position={[0, -0.3, 0]} className="lbl big">
            Атом ядросы (p⁺, n⁰)
          </Label>
        </group>
      )}

      {(mode === 'random' || mode === 'directed') && (
        <group ref={wireGroup} position={[0, 1.2, 0]}>
          {/* Металл сым кесіндісі */}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.9, 0.9, 8, 32, 1, true]} />
            <meshPhysicalMaterial
              color="#334155"
              transparent
              opacity={0.25}
              roughness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Сымдағы электрондар */}
          {wireE.current.map((p, idx) => (
            <Electron key={idx} position={[p.x, p.y, p.z]} radius={0.075} />
          ))}

          <Label position={[0, 1.3, 0]} className="lbl big">
            {mode === 'random'
              ? 'Кездейсоқ қозғалыс (ток жоқ)'
              : 'Бағытталған қозғалыс = ЭЛЕКТР ТОҒЫ ⚡'}
          </Label>
        </group>
      )}
    </group>
  )
}

export default function ElectronPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const [picked, setPicked] = useState(false)
  const navigate = useNavigate()

  const lesson = lessonsData.lessons.find((l) => l.id === 'electron')
  const complete = useApp((s) => s.complete)

  const handlePickElectron = () => {
    play('zap')
    setPicked(true)
  }

  const handleFinish = () => {
    complete('electron')
    navigate('/battery')
  }

  let mode = 'atom'
  if (stepIdx === 2) mode = 'random'
  if (stepIdx >= 3) mode = 'directed'

  return (
    <div className="page">
      <Stage camera={{ position: [0, 2.8, 7.5], fov: 42 }} target={[0, 1.2, 0]}>
        <AtomScene mode={mode} onPickElectron={handlePickElectron} />
      </Stage>

      <LessonDialogue
        eyebrow="3-БӨЛІМ — ЭЛЕКТРОНМЕН ТАНЫС"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {stepIdx <= 1 && (
          <div className="callout" style={{ marginTop: 10 }}>
            {picked ? (
              <span>✨ Тамаша! Сен электронды таптың: <b>e⁻</b> — теріс зарядталған бөлшек.</span>
            ) : (
              <span>👆 Жарқыраған бөлшекті (электронды) бас.</span>
            )}
          </div>
        )}

        {stepIdx >= 2 && (
          <div className="split" style={{ marginTop: 12 }}>
            <div style={{ background: mode === 'random' ? 'var(--warn-soft)' : 'var(--bg)' }}>
              <h4>Кездейсоқ қозғалыс</h4>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, margin: 0 }}>
                e⁻   e⁻<br />  e⁻     e⁻
              </p>
              <small style={{ display: 'block', marginTop: 4, color: 'var(--muted)' }}>
                Электр тогы жоқ
              </small>
            </div>
            <div style={{ background: mode === 'directed' ? 'var(--ok-soft)' : 'var(--bg)' }}>
              <h4>Бағытталған қозғалыс</h4>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, margin: 0, color: 'var(--accent)' }}>
                e⁻ → e⁻ → e⁻ →
              </p>
              <small style={{ display: 'block', marginTop: 4, color: 'var(--ok)', fontWeight: 700 }}>
                Электр тогы түзіледі ⚡
              </small>
            </div>
          </div>
        )}
      </LessonDialogue>
    </div>
  )
}
