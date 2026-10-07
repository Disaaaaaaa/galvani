import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines, Html } from '@react-three/drei'
import * as THREE from 'three'
import { C } from '../../lib/colors'
import { useHoverable } from './common'

// ---------- Геометрия константалары (барлық бөлімде бірдей) ----------
export const XL = -2.2 // анод жағы (Zn)
export const XR = 2.2 // катод жағы (Cu)
export const BEAKER_R = 1.1
export const BEAKER_H = 2.5
export const SOL_TOP = 1.84
export const EL_W = 0.55
export const EL_H = 2.9
export const EL_D = 0.14
export const EL_Y0 = 0.35
export const EL_TOP = EL_Y0 + EL_H
export const WIRE_Y = 4.3
export const VOLT_POS = [0, 4.35, 0]
export const BRIDGE_Z = -0.55

// Сыртқы сым: Zn → вольтметр → Cu (электрондар тек осы жолмен жүреді, §60)
export const wireCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(XL, EL_TOP - 0.05, 0),
    new THREE.Vector3(XL, 3.85, 0),
    new THREE.Vector3(XL + 0.25, WIRE_Y, 0),
    new THREE.Vector3(-0.7, WIRE_Y, 0),
    new THREE.Vector3(0, WIRE_Y - 0.02, 0),
    new THREE.Vector3(0.7, WIRE_Y, 0),
    new THREE.Vector3(XR - 0.25, WIRE_Y, 0),
    new THREE.Vector3(XR, 3.85, 0),
    new THREE.Vector3(XR, EL_TOP - 0.05, 0),
  ],
  false,
  'centripetal'
)

// Тұз көпірі: иондар тек осы жолмен (§60)
export const bridgeCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-1.55, 0.95, BRIDGE_Z),
    new THREE.Vector3(-1.55, 2.55, BRIDGE_Z),
    new THREE.Vector3(-1.15, 3.25, BRIDGE_Z),
    new THREE.Vector3(0, 3.45, BRIDGE_Z),
    new THREE.Vector3(1.15, 3.25, BRIDGE_Z),
    new THREE.Vector3(1.55, 2.55, BRIDGE_Z),
    new THREE.Vector3(1.55, 0.95, BRIDGE_Z),
  ],
  false,
  'centripetal'
)

// Камера позициялары (§50 FOCUS)
export const CAM_PRESETS = {
  overview: { pos: [6.2, 6.2, 9.6], target: [0, 2, 0] },
  front: { pos: [0, 4.2, 11], target: [0, 2.1, 0] },
  zn: { pos: [-1.0, 2.4, 3.6], target: [XL, 1.35, 0.1] },
  cu: { pos: [3.4, 2.4, 3.6], target: [XR, 1.35, 0.1] },
  wire: { pos: [0.4, 5.0, 5.2], target: [0, 4.0, 0] },
  voltmeter: { pos: [0.4, 5.0, 4.2], target: [0, 4.2, 0] },
  bridge: { pos: [0, 4.4, 5.4], target: [0, 2.6, BRIDGE_Z] },
  znsol: { pos: [-1.0, 2.4, 4.4], target: [XL, 1.0, 0] },
  cusol: { pos: [3.4, 2.4, 4.4], target: [XR, 1.0, 0] },
}

// ---------- Бөлшектер ----------
export function Beaker({ x = 0, highlight }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, BEAKER_H / 2, 0]} renderOrder={3}>
        <cylinderGeometry args={[BEAKER_R, BEAKER_R * 0.97, BEAKER_H, 48, 1, true]} />
        <meshPhysicalMaterial
          color={C.glass}
          transparent
          opacity={0.2}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        {highlight && <Outlines thickness={3} color="#d97706" screenspace />}
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2} renderOrder={3}>
        <circleGeometry args={[BEAKER_R * 0.97, 48]} />
        <meshPhysicalMaterial color={C.glass} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh position={[0, BEAKER_H, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[BEAKER_R, 0.025, 8, 64]} />
        <meshStandardMaterial color="#e6f0fa" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      {/* өлшеу сызықтары */}
      {[0.6, 1.1, 1.6].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[BEAKER_R + 0.003, 0.006, 4, 48, 0.5]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Solution({ x = 0, color, matRef, info, name, onPick, interactive = true, opacity = 0.45, highlight }) {
  const [hovered, handlers] = useHoverable(info, name, onPick, interactive)
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, (SOL_TOP + 0.04) / 2, 0]} renderOrder={1} {...handlers}>
        <cylinderGeometry args={[BEAKER_R - 0.05, BEAKER_R * 0.96 - 0.05, SOL_TOP - 0.04, 48]} />
        <meshStandardMaterial ref={matRef} color={color} transparent opacity={opacity} roughness={0.2} depthWrite={false} />
        {(hovered || highlight) && <Outlines thickness={hovered ? 2 : 4} color={highlight ? '#d97706' : '#0b5cff'} screenspace />}
      </mesh>
    </group>
  )
}

export function Electrode({ metal = 'zn', x = 0, groupRef, info, name, onPick, interactive = true, highlight }) {
  const [hovered, handlers] = useHoverable(info, name ?? metal, onPick, interactive)
  const color = metal === 'zn' ? C.znMetal : C.cuMetal
  return (
    <group ref={groupRef} position={[x, EL_Y0 + EL_H / 2, 0]}>
      <mesh castShadow {...handlers}>
        <boxGeometry args={[EL_W, EL_H, EL_D]} />
        <meshStandardMaterial
          color={color}
          metalness={metal === 'zn' ? 0.75 : 0.85}
          roughness={metal === 'zn' ? 0.42 : 0.3}
          emissive={hovered ? color : '#000'}
          emissiveIntensity={hovered ? 0.18 : 0}
        />
        {(hovered || highlight) && (
          <Outlines thickness={highlight ? 5 : 3} color={highlight ? '#d97706' : '#0b5cff'} screenspace />
        )}
      </mesh>
      {/* қысқыш (клемма): Zn — қара «−», Cu — қызыл «+» */}
      <mesh position={[0, EL_H / 2 - 0.08, 0]}>
        <boxGeometry args={[0.22, 0.2, 0.24]} />
        <meshStandardMaterial color={metal === 'zn' ? '#1f2937' : '#dc2626'} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Wire({ info, onPick, interactive = true, highlight }) {
  const [hovered, handlers] = useHoverable(info, 'wire', onPick, interactive)
  const geo = useMemo(() => new THREE.TubeGeometry(wireCurve, 160, 0.035, 10, false), [])
  const hit = useMemo(() => new THREE.TubeGeometry(wireCurve, 80, 0.14, 6, false), [])
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial
          color={hovered || highlight ? '#0b5cff' : C.wire}
          metalness={0.4}
          roughness={0.35}
          emissive={highlight ? '#d97706' : '#000'}
          emissiveIntensity={highlight ? 0.6 : 0}
        />
      </mesh>
      {/* басуға ыңғайлы болу үшін көрінбейтін қалың hit-аймақ */}
      <mesh geometry={hit} visible={false} {...handlers} />
    </group>
  )
}

export function SaltBridge({ info, onPick, interactive = true, highlight, opacity = 0.42 }) {
  const [hovered, handlers] = useHoverable(info, 'bridge', onPick, interactive)
  const geo = useMemo(() => new THREE.TubeGeometry(bridgeCurve, 140, 0.17, 20, false), [])
  const ends = [bridgeCurve.getPointAt(0), bridgeCurve.getPointAt(1)]
  return (
    <group>
      <mesh geometry={geo} renderOrder={4} {...handlers}>
        <meshPhysicalMaterial
          color={hovered ? '#dbeafe' : '#f1f5f9'}
          transparent
          opacity={opacity}
          roughness={0.15}
          clearcoat={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        {(hovered || highlight) && <Outlines thickness={highlight ? 5 : 2.5} color={highlight ? '#d97706' : '#0b5cff'} screenspace />}
      </mesh>
      {ends.map((p, i) => (
        <mesh key={i} position={[p.x, p.y - 0.02, p.z]}>
          <cylinderGeometry args={[0.17, 0.17, 0.12, 20]} />
          <meshStandardMaterial color="#f8f4e8" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

export function Voltmeter({ info, onPick, interactive = true, reading = '1.10', highlight }) {
  const [hovered, handlers] = useHoverable(info, 'voltmeter', onPick, interactive)
  return (
    <group position={VOLT_POS}>
      <RoundedBox args={[1.45, 1.0, 0.38]} radius={0.1} smoothness={4} castShadow {...handlers}>
        <meshStandardMaterial color={hovered ? '#ffd84d' : '#f6c915'} roughness={0.45} />
        {highlight && <Outlines thickness={5} color="#d97706" screenspace />}
      </RoundedBox>
      <mesh position={[0, 0.12, 0.195]}>
        <planeGeometry args={[1.05, 0.42]} />
        <meshStandardMaterial color="#0b1f1a" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.27, 0.2]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.55, -0.3, 0.2]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.55, -0.3, 0.2]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <Html position={[0, 0.12, 0.21]} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
        <div className="volt-screen">{reading} V</div>
      </Html>
    </group>
  )
}

/** Орнына түскен бөлшектің жұмсақ «құлап түсу» анимациясы */
export function DropIn({ children, from = 1.4, delay = 0 }) {
  const ref = useRef()
  const t = useRef(-delay)
  useFrame((_, dt) => {
    if (!ref.current) return
    t.current = Math.min(1, t.current + dt * 2.6)
    const k = Math.max(0, t.current)
    const e = 1 - Math.pow(1 - k, 3)
    ref.current.position.y = (1 - e) * from
    ref.current.scale.setScalar(0.85 + 0.15 * e)
  })
  return (
    <group ref={ref} position-y={from}>
      {children}
    </group>
  )
}

export function Table({ y = 0, size = [12, 7] }) {
  return (
    <mesh position={[0, y - 0.06, 0]} receiveShadow>
      <boxGeometry args={[size[0], 0.12, size[1]]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} />
    </mesh>
  )
}
