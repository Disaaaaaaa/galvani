import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import Stage from '../components/three/Stage'
import LessonDialogue from '../components/ui/LessonDialogue'
import { Electron, Label } from '../components/three/common'
import { C } from '../lib/colors'
import { play } from '../lib/sound'
import { useApp } from '../store/useApp'
import lessonsData from '../content/lessons.json'

function BatteryInsideScene({ opacity, eSpeed }) {
  const eGroup = useRef()
  useFrame((_, dt) => {
    if (eGroup.current) eGroup.current.rotation.y += dt * eSpeed
  })

  return (
    <group position={[0, 1.2, 0]}>
      {/* Сыртқы қабық (слайдер бойынша мөлдір болады, §10) */}
      <mesh castShadow>
        <cylinderGeometry args={[1.0, 1.0, 3.2, 48]} />
        <meshPhysicalMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Оң анод/катод ішкі аймақтары (§10) */}
      {/* Теріс аймақ (-) — түбі */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 1.2, 32]} />
        <meshStandardMaterial color={C.anode} transparent opacity={1.1 - opacity} roughness={0.4} />
      </mesh>

      {/* Электролит аралық қабаты */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.4, 32]} />
        <meshStandardMaterial color="#fef08a" transparent opacity={1.1 - opacity} roughness={0.6} />
      </mesh>

      {/* Оң аймақ (+) — жоғарғы жағы */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 1.2, 32]} />
        <meshStandardMaterial color={C.cathode} transparent opacity={1.1 - opacity} roughness={0.4} />
      </mesh>

      {/* Электрондар (§10) */}
      <group ref={eGroup}>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
          <Electron
            key={i}
            position={[Math.sin(i * 1.5) * 0.5, y, Math.cos(i * 1.5) * 0.5]}
            radius={0.075}
          />
        ))}
      </group>

      {/* Мөлдір кезде шығатын ішкі белгілер */}
      {opacity < 0.7 && (
        <>
          <Label position={[-1.3, 0.8, 0]} className="lbl" style={{ background: C.cathode, color: '#fff' }}>
            Оң аймақ (+)
          </Label>
          <Label position={[-1.3, 0, 0]} className="lbl" style={{ background: '#fef08a', color: '#854d0e' }}>
            Электролит
          </Label>
          <Label position={[-1.3, -0.8, 0]} className="lbl" style={{ background: C.anode, color: '#fff' }}>
            Теріс аймақ (−)
          </Label>
        </>
      )}
    </group>
  )
}

export default function BatteryPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const [sliderVal, setSliderVal] = useState(0.5) // §10 Slider: Сырты ━━●━━ Іші
  const [ans, setAns] = useState(null)
  const navigate = useNavigate()

  const lesson = lessonsData.lessons.find((l) => l.id === 'battery')
  const complete = useApp((s) => s.complete)

  const handleFinish = () => {
    complete('battery')
    navigate('/history')
  }

  const handleAns = (choice) => {
    play(choice === 'no' ? 'correct' : 'wrong')
    setAns(choice)
  }

  return (
    <div className="page">
      <Stage camera={{ position: [0, 2.5, 6.5], fov: 42 }} target={[0, 1.2, 0]}>
        <BatteryInsideScene opacity={1 - sliderVal * 0.85} eSpeed={stepIdx >= 2 ? 2.5 : 0.8} />
      </Stage>

      <LessonDialogue
        eyebrow="4–5 БӨЛІМ — БАТАРЕЙКА ІШІНДЕ"
        steps={lesson.steps}
        stepIndex={stepIdx}
        onStepChange={setStepIdx}
        onFinish={handleFinish}
      >
        {/* Step 0 Сырғытпа (§10) */}
        {stepIdx <= 1 && (
          <div className="slider-wrap" style={{ marginTop: 14, justifyContent: 'center' }}>
            <span>Сырты</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sliderVal}
              style={{ '--p': `${Math.round(sliderVal * 100)}%` }}
              onChange={(e) => setSliderVal(parseFloat(e.target.value))}
            />
            <span>Іші</span>
          </div>
        )}

        {/* Step 2 Сұрақ: "Батарейка электр энергиясын жаңадан жасап шығара ма?" (§11) */}
        {stepIdx >= 2 && (
          <div style={{ marginTop: 12 }}>
            <div className="q-text">Батарейка электр энергиясын жаңадан жасап шығара ма?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                className={`btn btn-lg ${ans === 'yes' ? 'q-option wrong' : ''}`}
                onClick={() => handleAns('yes')}
              >
                ИӘ
              </button>
              <button
                className={`btn btn-lg ${ans === 'no' ? 'q-option correct' : 'btn-primary'}`}
                onClick={() => handleAns('no')}
              >
                ЖОҚ
              </button>
            </div>

            {ans && (
              <div className={`feedback ${ans === 'no' ? 'ok' : 'bad'}`} style={{ marginTop: 10 }}>
                <span>{ans === 'no' ? '✓' : '✕'}</span>
                <div>
                  <b>{ans === 'no' ? 'Дұрыс!' : 'Қате.'}</b> Энергия жоқтан пайда болмайды. Ол
                  химиялық реакция нәтижесінде электр энергиясына айналады.
                </div>
              </div>
            )}

            {/* Энергияның түрлену тізбегі (§11) */}
            <div className="energy-flow" style={{ marginTop: 14 }}>
              <div className="ef" style={{ background: '#fef08a', color: '#854d0e' }}>
                🧪 Химиялық бөлшектер (заттар)
              </div>
              <div className="arrow">↓ (реакция жүреді)</div>
              <div className="ef" style={{ background: 'var(--electron-soft)', color: '#0369a1' }}>
                ⚡ Электрондардың қозғалысы
              </div>
              <div className="arrow">↓ (тізбекпен ағады)</div>
              <div className="ef" style={{ background: 'var(--ok-soft)', color: '#166534' }}>
                💡 Электр энергиясы (құрылғы жұмысы)
              </div>
            </div>
          </div>
        )}
      </LessonDialogue>
    </div>
  )
}
