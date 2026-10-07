import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import Stage from '../components/three/Stage'
import { Electron, Label } from '../components/three/common'
import { play } from '../lib/sound'

function HeroScene({ zooming, onZoomEnd }) {
  const group = useRef()
  const battery = useRef()
  const eGroup = useRef()

  useFrame((state, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.15
    if (eGroup.current) eGroup.current.rotation.y += dt * 0.4
    if (zooming && state.camera.position.z > 3.2) {
      state.camera.position.lerp(new THREE.Vector3(0, 1.4, 2.8), dt * 3.5)
      state.camera.lookAt(0, 1.4, 0)
      if (state.camera.position.z <= 3.3) onZoomEnd()
    }
  })

  return (
    <group ref={group}>
      {/* 3D Батарейка (§6) */}
      <group ref={battery} position={[0, 0, 0]}>
        {/* Сыртқы мөлдір корпус */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 2.6, 48]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.7} roughness={0.2} transparent opacity={0.88} />
        </mesh>
        {/* Батарейка полюсі (+) */}
        <mesh position={[0, 2.8, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.25, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Батарейка негізі (-) */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 0.1, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Әлсіз қозғалатын электрондар (§6) */}
        <group ref={eGroup} position={[0, 1.4, 0]}>
          {[-0.3, 0.1, 0.4].map((y, i) => (
            <Electron key={i} position={[Math.sin(i * 2) * 0.35, y, Math.cos(i * 2) * 0.35]} radius={0.06} />
          ))}
        </group>
        <Label position={[0, 1.4, 0.72]} className="lbl mono" style={{ background: '#0b5cff', color: '#fff' }}>
          AA 1.5V
        </Label>
      </group>

      {/* Айналасындағы 3D құрылғылар: пульт, қолшам, ойыншық (§6) */}
      {/* 1. Пульт */}
      <group position={[-2.4, 0.25, 0.8]} rotation={[0.2, 0.4, -0.1]}>
        <RoundedBox args={[0.9, 0.22, 2.2]} radius={0.06} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.12, -0.8]}>
          <boxGeometry args={[0.25, 0.06, 0.2]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <Label position={[0, 0.3, 0]}>Пульт</Label>
      </group>

      {/* 2. Қолшам */}
      <group position={[2.4, 0.4, 0.4]} rotation={[0, -0.5, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.8, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.45, 0.32, 0.4, 24]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
        </mesh>
        <Label position={[0, 0.6, 0]}>Қолшам</Label>
      </group>

      {/* 3. Ойыншық көлік */}
      <group position={[0.2, 0.3, -2.4]} rotation={[0, 2.4, 0]}>
        <RoundedBox args={[1.2, 0.5, 2.0]} radius={0.12} castShadow>
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[1.0, 0.4, 1.0]} radius={0.1} position={[0, 0.4, -0.1]}>
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
        </RoundedBox>
        {[-0.65, 0.65].map((x) =>
          [-0.6, 0.6].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.1, z]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 20]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))
        )}
        <Label position={[0, 0.7, 0]}>Ойыншық</Label>
      </group>
    </group>
  )
}

export default function HomePage() {
  const [zooming, setZooming] = useState(false)
  const navigate = useNavigate()

  const handleStart = () => {
    play('start')
    setZooming(true)
  }

  return (
    <div className="page" style={{ background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #eef2f7 100%)' }}>
      <Stage camera={{ position: [0, 2.8, 6.2], fov: 42 }} target={[0, 1.2, 0]} autoRotate={!zooming}>
        <HeroScene zooming={zooming} onZoomEnd={() => navigate('/electricity')} />
      </Stage>

      <div className="hero-overlay">
        <div className="hero-kicker">3D ИНТЕРАКТИВТІ ОҚЫТУ ПЛАТФОРМАСЫ</div>
        <h1 className="hero-title">ЭЛЕКТРОННЫҢ САЯХАТЫ</h1>
        <p className="hero-sub">
          Батарейканың ішінде не болып жатқанын, электрондардың қалай қозғалатынын және химиялық энергияның электр тогына қалай айналатынын өз көзіңмен көр.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={handleStart}>
            🚀 Саяхатты бастау
          </button>
          <button className="btn btn-lg" onClick={() => navigate('/lab')}>
            🧪 Виртуалды зертхана
          </button>
        </div>

        <div className="hero-meta">8–11 сынып оқушылары мен химия мұғалімдеріне арналған 3D оқу құралы</div>
      </div>
    </div>
  )
}
