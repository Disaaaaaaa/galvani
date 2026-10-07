import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Electron, Label } from '../components/three/common'
import { Table } from '../components/three/cellParts'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'
import lessonsData from '../content/lessons.json'

function InteractiveDevicesScene({ activeDev, xray, pressed, onPick }) {
  const eGroup = useRef()
  useFrame((_, dt) => {
    if (eGroup.current && pressed) eGroup.current.rotation.y += dt * 4
  })

  return (
    <group>
      <Table y={0} size={[10, 6]} />

      {/* 1. Теледидар пульті (§7, §8) */}
      <group
        position={[-1.6, 0.12, 0.4]}
        rotation={[0, 0.3, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onPick('remote')
        }}
      >
        <RoundedBox args={[0.9, 0.24, 2.2]} radius={0.08} castShadow>
          <meshPhysicalMaterial
            color={activeDev === 'remote' ? '#0f172a' : '#1e293b'}
            transparent={xray}
            opacity={xray ? 0.35 : 1}
            roughness={0.4}
          />
        </RoundedBox>

        {/* Пульт батырмалары */}
        {[-0.6, -0.2, 0.2, 0.6].map((z, idx) => (
          <mesh key={idx} position={[0, 0.14, z]}>
            <boxGeometry args={[0.5, 0.08, 0.22]} />
            <meshStandardMaterial color={idx === 0 ? '#ef4444' : '#64748b'} />
          </mesh>
        ))}

        {/* Ішкі рентген құрылымы (§8) */}
        {xray && (
          <group position={[0, 0, 0]}>
            {/* ИК ЖАРЫҚДИОД (IR LED) */}
            <mesh position={[0, 0.08, -1.15]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={pressed ? 2.5 : 0.2}
              />
            </mesh>

            {/* Өткізгіш жолдар (микросхема) */}
            <mesh position={[0, -0.02, 0]}>
              <boxGeometry args={[0.7, 0.02, 1.8]} />
              <meshStandardMaterial color="#059669" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* Ішкі AA батарейка */}
            <mesh position={[0, 0.02, 0.4]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.2, 0.2, 0.9, 24]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.7} />
            </mesh>

            {/* Қозғалатын электрондар (§8) */}
            {pressed && (
              <group ref={eGroup} position={[0, 0.08, 0]}>
                <Electron position={[-0.2, 0, -0.4]} radius={0.04} />
                <Electron position={[0.2, 0, 0]} radius={0.04} />
                <Electron position={[-0.1, 0, 0.3]} radius={0.04} />
              </group>
            )}
          </group>
        )}

        <Label position={[0, 0.35, 0]}>{xray ? 'Пульт (Рентген)' : 'Пульт'}</Label>
      </group>

      {/* 2. Қолшам */}
      <group
        position={[0.2, 0.28, -0.8]}
        rotation={[0, -0.4, 0.2]}
        onClick={(e) => {
          e.stopPropagation()
          onPick('flashlight')
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.32, 1.6, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.4, 0.28, 0.35, 24]} />
          <meshStandardMaterial
            color="#fff"
            emissive={activeDev === 'flashlight' ? '#fbbf24' : '#e0f2fe'}
            emissiveIntensity={activeDev === 'flashlight' ? 2 : 0.2}
          />
        </mesh>
        <Label position={[0, 0.5, 0]}>Қолшам</Label>
      </group>

      {/* 3. Ойыншық көлік */}
      <group
        position={[1.8, 0.28, 0.6]}
        rotation={[0, -2.1, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onPick('toy')
        }}
      >
        <RoundedBox args={[1.0, 0.45, 1.8]} radius={0.1} castShadow>
          <meshStandardMaterial color={activeDev === 'toy' ? '#10b981' : '#dc2626'} roughness={0.3} />
        </RoundedBox>
        <Label position={[0, 0.6, 0]}>Ойыншық</Label>
      </group>

      {/* Виртуалды Теледидар (§7, §8) */}
      <group position={[0, 2.6, -2.6]}>
        <RoundedBox args={[3.6, 2.1, 0.15]} radius={0.08} castShadow>
          <meshStandardMaterial color="#020617" roughness={0.2} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[3.4, 1.9]} />
          <meshStandardMaterial
            color={pressed || activeDev === 'remote' ? '#38bdf8' : '#0f172a'}
            emissive={pressed || activeDev === 'remote' ? '#0284c7' : '#000'}
            emissiveIntensity={pressed || activeDev === 'remote' ? 0.8 : 0}
          />
        </mesh>
        <Label position={[0, 0, 0.12]} className="lbl big">
          {pressed || activeDev === 'remote' ? '📺 TV ҚОСЫЛДЫ!' : '📺 Теледидар'}
        </Label>
      </group>
    </group>
  )
}

export default function ElectricityPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const [activeDev, setActiveDev] = useState(null)
  const [pressed, setPressed] = useState(false)
  const [qAnswered, setQAnswered] = useState(false)
  const navigate = useNavigate()

  const lesson = lessonsData.lessons.find((l) => l.id === 'electricity')
  const complete = useApp((s) => s.complete)

  const handlePick = (dev) => {
    play('click')
    setActiveDev(dev)
    if (dev === 'remote') play('zap')
  }

  const handlePressBtn = () => {
    play('zap')
    setPressed(true)
    setTimeout(() => play('correct'), 800)
  }

  const handleFinish = () => {
    complete('electricity')
    navigate('/electron')
  }

  const xray = stepIdx >= 2

  return (
    <div className="page">
      <Stage camera={{ position: [0, 3.8, 6.5], fov: 42 }} target={[0, 1.2, 0]}>
        <InteractiveDevicesScene
          activeDev={activeDev}
          xray={xray}
          pressed={pressed}
          onPick={handlePick}
        />
      </Stage>

      <LessonDialogue
        eyebrow="1–2 БӨЛІМ"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {/* Step 1 Интерактив сұрағы (§7) */}
        {stepIdx === 1 && (
          <div className="question" style={{ marginTop: 12 }}>
            <div className="q-text">Осы құрылғылардың барлығына не ортақ?</div>
            <div className="q-options">
              {['Батарейка (Ток көзі)', 'Дыбыс', 'Магнит'].map((opt, i) => (
                <button
                  key={i}
                  className={`q-option ${qAnswered && i === 0 ? 'correct' : ''}`}
                  onClick={() => {
                    if (i === 0) {
                      play('correct')
                      setQAnswered(true)
                    } else play('wrong')
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 "Батырманы бас" батырмасы (§8) */}
        {stepIdx >= 2 && (
          <div style={{ marginTop: 12 }}>
            <button
              className={`btn btn-lg ${pressed ? 'btn-dark' : 'btn-primary'}`}
              style={{ width: '100%' }}
              onClick={handlePressBtn}
            >
              {pressed ? '✓ Тізбек тұйықталды — TV қосылды!' : '🔴 Батырманы бас (Пульт)'}
            </button>

            {pressed && (
              <div className="chain">
                <div className="chain-step done">
                  <span className="ic">1</span> Батырма басылды
                </div>
                <div className="chain-step done">
                  <span className="ic">2</span> Тізбек тұйықталды
                </div>
                <div className="chain-step done">
                  <span className="ic">3</span> Химиялық реакция іске қосылды
                </div>
                <div className="chain-step on">
                  <span className="ic">4</span> Электрондар бағытталды
                </div>
                <div className="chain-step done">
                  <span className="ic">5</span> Инфрақызыл сигнал → Теледидар қосылды!
                </div>
              </div>
            )}
          </div>
        )}
      </LessonDialogue>
    </div>
  )
}
