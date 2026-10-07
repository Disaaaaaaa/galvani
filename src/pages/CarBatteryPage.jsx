import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Electron, Label } from '../components/three/common'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'

function CarScene({ started }) {
  const engineRef = useRef()
  const eGroup = useRef()

  useFrame((state, dt) => {
    if (started && engineRef.current) engineRef.current.rotation.x += dt * 12
    if (started && eGroup.current) eGroup.current.rotation.z += dt * 6
  })

  return (
    <group position={[0, 0.4, 0]}>
      {/* 3D Автокөлік мөлдір корпусы (§32) */}
      <group position={[0, 0.8, 0]}>
        <RoundedBox args={[2.4, 0.9, 4.4]} radius={0.15} castShadow>
          <meshPhysicalMaterial
            color="#0f172a"
            transparent
            opacity={started ? 0.35 : 0.85}
            roughness={0.2}
          />
        </RoundedBox>
        <RoundedBox args={[2.0, 0.75, 2.2]} radius={0.12} position={[0, 0.75, -0.2]}>
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.4} />
        </RoundedBox>
      </group>

      {/* 1. Автомобиль аккумуляторы (6 элемент = 12 В, Pb & PbO₂, §31, §32) */}
      <group position={[-0.6, 0.6, 1.4]}>
        <RoundedBox args={[0.7, 0.55, 0.8]} radius={0.06} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </RoundedBox>
        {/* 6 секция қақпағы */}
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
            <meshStandardMaterial color={i === 0 ? '#ef4444' : '#64748b'} />
          </mesh>
        ))}
        <Label position={[0, 0.45, 0]} className="lbl mono" style={{ background: '#0f172a', color: '#fff' }}>
          Pb / PbO₂ (12V)
        </Label>
      </group>

      {/* 2. Кабельдер (§32) */}
      <mesh position={[0, 0.8, 0.8]} rotation-x={Math.PI / 2}>
        <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 0.6, 0.6), new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(0.6, 0.8, -0.6)]), 30, 0.03, 8]} />
        <meshStandardMaterial color={started ? '#ef4444' : '#334155'} emissive={started ? '#ef4444' : '#000'} emissiveIntensity={started ? 0.6 : 0} />
      </mesh>

      {/* 3. Стартер & Қозғалтқыш (§32) */}
      <group position={[0.6, 0.7, -0.6]}>
        <mesh ref={engineRef}>
          <cylinderGeometry args={[0.45, 0.45, 0.9, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        <Label position={[0, 0.65, 0]} className="lbl">
          {started ? '⚙️ Қозғалтқыш іске қосылды!' : '⚙️ Стартер / Қозғалтқыш'}
        </Label>
      </group>

      {/* Электрондар (§32) */}
      {started && (
        <group ref={eGroup} position={[0, 0.8, 0.4]}>
          <Electron position={[-0.4, 0, 0]} radius={0.06} />
          <Electron position={[0, 0.2, -0.2]} radius={0.06} />
          <Electron position={[0.4, 0, -0.4]} radius={0.06} />
        </group>
      )}
    </group>
  )
}

export default function CarBatteryPage() {
  const [started, setStarted] = useState(false)
  const navigate = useNavigate()

  const handleStart = () => {
    play('zap')
    setStarted(true)
    setTimeout(() => play('correct'), 600)
  }

  return (
    <div className="page">
      <Stage camera={{ position: [3.8, 3.8, 6.8], fov: 42 }} target={[0, 0.8, 0]}>
        <CarScene started={started} />
      </Stage>

      <LessonDialogue
        eyebrow="КҮНДЕЛІКТІ ӨМІР — АВТОМОБИЛЬ АККУМУЛЯТОРЫ"
        steps={[
          {
            title: 'Автомобиль аккумуляторы',
            text: 'Автомобиль аккумуляторы — алты гальваникалық элементтен тұратын тізбек. Теріс электрод: Pb (қорғасын), оң электрод: PbO₂, электролит: H₂SO₄. Кернеуі: ≈ 12 В.',
          },
          {
            title: 'Разряд және Заряд',
            text: 'Қозғалтқышты оталдыру кезінде аккумулятор гальваникалық элемент ретінде жұмыс істеп, химиялық энергияны электр энергиясына айналдырады. Ал автокөлік жүріп тұрғанда генератор оны қайта зарядтап, электролиз процесі жүреді.',
          },
        ]}
        stepIndex={started ? 1 : 0}
        onStepChange={() => {}}
        onFinish={() => navigate('/tasks')}
        finishLabel="Тапсырмаларға өту"
      >
        <div style={{ marginTop: 12 }}>
          <button
            className={`btn btn-lg ${started ? 'btn-dark' : 'btn-primary'}`}
            style={{ width: '100%' }}
            onClick={handleStart}
          >
            {started ? '✓ START — Қозғалтқыш жұмыс істеп тұр!' : '🚗 START (Автомобильді оталдыру)'}
          </button>

          {started && (
            <div className="chain" style={{ marginTop: 10 }}>
              <div className="chain-step done">
                <span className="ic">1</span> Химиялық энергия (Pb + PbO₂ + H₂SO₄)
              </div>
              <div className="chain-step done">
                <span className="ic">2</span> Электр энергиясы (12 В)
              </div>
              <div className="chain-step done">
                <span className="ic">3</span> Стартер айналды
              </div>
              <div className="chain-step on">
                <span className="ic">4</span> Қозғалтқыш оталды!
              </div>
            </div>
          )}
        </div>
      </LessonDialogue>
    </div>
  )
}
