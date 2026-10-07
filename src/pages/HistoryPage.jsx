import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Label } from '../components/three/common'
import { Table } from '../components/three/cellParts'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'
import lessonsData from '../content/lessons.json'

function FrogLegScene({ touched, onTouch }) {
  const legRef = useRef()
  const impulseRef = useRef()

  useFrame((state, dt) => {
    if (touched && legRef.current) {
      // Ғылыми-схемалық модельдің жиырылу анимациясы (§12)
      legRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 35) * 0.28
    } else if (legRef.current) {
      legRef.current.rotation.z = 0
    }
  })

  return (
    <group>
      <Table y={0} size={[10, 6]} />

      {/* Ғылыми-схемалық модель (§12): сүйекпен жүйке сызығы */}
      <group position={[-0.8, 0.4, 0]}>
        {/* Нерв нүктесі */}
        <mesh position={[0.4, 0.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={touched ? 1.5 : 0.3} />
        </mesh>

        {/* Аяқ жиырылу тобы */}
        <group ref={legRef} position={[0, 0.4, 0]}>
          <mesh position={[0, -0.6, 0]}>
            <capsuleGeometry args={[0.22, 1.2, 10, 20]} />
            <meshStandardMaterial color="#86efac" roughness={0.5} />
          </mesh>
          <mesh position={[0.4, -1.3, 0]} rotation-z={-0.4}>
            <capsuleGeometry args={[0.16, 0.9, 10, 20]} />
            <meshStandardMaterial color="#4ade80" roughness={0.5} />
          </mesh>
        </group>

        <Label position={[0.4, 0.8, 0]} className="lbl" style={{ background: '#fef08a', color: '#854d0e' }}>
          ⚡ Жүйке түйіні (Тигіз)
        </Label>
      </group>

      {/* Металл скальпель / сым (§12) */}
      <group
        position={touched ? [-0.35, 0.88, 0] : [1.4, 0.6, 0.4]}
        rotation={touched ? [0, 0, -0.8] : [0, 0.4, 0.5]}
        onClick={(e) => {
          e.stopPropagation()
          onTouch()
        }}
        style={{ cursor: 'pointer' }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.12, 1.6, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <boxGeometry args={[0.18, 0.5, 0.12]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>

        <Label position={[0, 0.9, 0]} className="lbl">
          {touched ? 'Қос металл (Cu/Fe)' : 'Металл скальпель (Бас)'}
        </Label>
      </group>

      {/* Тәжірибе үстеліндегі бақылау бағанасы (Вольта бағаны) */}
      <group position={[2.6, 0.8, -1.2]}>
        {[0, 0.2, 0.4, 0.6, 0.8].map((y, idx) => (
          <group key={idx} position={[0, y, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.08, 24]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#a9b4c2' : '#c9783e'} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.04, 24]} />
              <meshStandardMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}
        <Label position={[0, 1.1, 0]} className="lbl mono">
          Вольта бағаны (1800 ж.)
        </Label>
      </group>
    </group>
  )
}

export default function HistoryPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const [touched, setTouched] = useState(false)
  const navigate = useNavigate()

  const lesson = lessonsData.lessons.find((l) => l.id === 'history')
  const complete = useApp((s) => s.complete)

  const handleTouch = () => {
    play('zap')
    setTouched(true)
    setTimeout(() => play('correct'), 300)
  }

  const handleFinish = () => {
    complete('history')
    navigate('/zn-cu')
  }

  return (
    <div className="page">
      <Stage camera={{ position: [0, 3.2, 6.2], fov: 42 }} target={[0, 0.8, 0]}>
        <FrogLegScene touched={touched} onTouch={handleTouch} />
      </Stage>

      <LessonDialogue
        eyebrow="6-БӨЛІМ — ГАЛЬВАНИДЕН ВОЛЬТАҒА"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {stepIdx === 0 && (
          <button
            className={`btn btn-lg ${touched ? 'btn-dark' : 'btn-primary'}`}
            style={{ width: '100%', marginTop: 12 }}
            onClick={handleTouch}
          >
            {touched ? '⚡ Серпіліс болды! Аяқ жиырылды' : '⚡ Металлды тигіз (Тәжірибе)'}
          </button>
        )}

        {/* Экран екіге бөлінеді: Гальвани vs Вольта (§12) */}
        {stepIdx >= 1 && (
          <div className="split" style={{ marginTop: 12 }}>
            <div style={{ background: '#fff7ed', borderColor: '#fdba74' }}>
              <h4 style={{ color: '#c2410c' }}>🐸 Луиджи Гальвани (1791)</h4>
              <p style={{ margin: 0, fontSize: 13 }}>
                «Электр тогы жануардың денесінің (бұлшықет пен жүйкенің) ішінде пайда болады (жануар электрі).»
              </p>
            </div>
            <div style={{ background: 'var(--electron-soft)', borderColor: 'var(--accent-2)' }}>
              <h4 style={{ color: '#0369a1' }}>🔋 Алессандро Вольта (1800)</h4>
              <p style={{ margin: 0, fontSize: 13 }}>
                «Электр тогы жануардан емес, <b>екі түрлі металл (Zn мен Cu)</b> ылғал ортада тигенде пайда болады!»
              </p>
            </div>
          </div>
        )}

        {/* Тарихи уақыт желісі (§12) */}
        {stepIdx >= 2 && (
          <div className="timeline" style={{ marginTop: 10 }}>
            <div className="tl-item">
              <div className="y">1781</div>
              <div className="d">Гальвани бақа аяғының мыс ілмек пен темір металға тигенде жиырылуын байқады.</div>
            </div>
            <div className="tl-item">
              <div className="y">1791</div>
              <div className="d">«Жануар электрі» туралы трактат жарияланды.</div>
            </div>
            <div className="tl-item">
              <div className="y">1800</div>
              <div className="d">Вольта алғашқы тұрақты ток көзін — «Вольта бағанын» ойлап тапты.</div>
            </div>
          </div>
        )}
      </LessonDialogue>
    </div>
  )
}
