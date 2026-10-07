import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { C, PARTICLE_INFO } from '../../lib/colors'
import { useSim, live } from '../../store/useSim'
import { useApp } from '../../store/useApp'
import { play } from '../../lib/sound'
import { Label, getGlowTexture, smooth, clamp01 } from './common'
import { getQuality } from './Stage'
import {
  XL,
  XR,
  BEAKER_R,
  SOL_TOP,
  EL_D,
  EL_TOP,
  EL_Y0,
  EL_H,
  BRIDGE_Z,
  wireCurve,
  bridgeCurve,
  CAM_PRESETS,
  Beaker,
  Solution,
  Electrode,
  Wire,
  SaltBridge,
  Voltmeter,
  DropIn,
} from './cellParts'

// ---------- Pause and Explore ақпараты (§25) ----------
export const CELL_INFO = {
  zn: { title: 'Zn электроды', text: 'Zn электрон береді.', roleText: 'Бұл — АНОД. Мұнда тотығу жүреді: Zn → Zn²⁺ + 2e⁻.' },
  cu: {
    title: 'Cu электроды',
    text: 'Cu²⁺ электрон қабылдайды.',
    roleText: 'Бұл — КАТОД. Мұнда тотықсыздану жүреді: Cu²⁺ + 2e⁻ → Cu.',
  },
  wire: { title: 'Сыртқы сым', text: 'Электрондардың қозғалу жолы.' },
  bridge: { title: 'Тұз көпірі', text: 'Иондардың қозғалу жолы. Зарядтарды теңестіреді. Электрон бұл жерден жүрмейді.' },
  voltmeter: { title: 'Вольтметр', text: 'Екі электрод арасындағы кернеуді өлшейді (≈ 1,10 В).' },
  znsol: { title: 'ZnSO₄ ерітіндісі', text: 'Электролит. Реакция жүрген сайын мұнда Zn²⁺ иондары көбейеді.' },
  cusol: { title: 'CuSO₄ ерітіндісі', text: 'Электролит. Көк түсті Cu²⁺ иондары бар; олар азайған сайын ерітінді ағарады.' },
}

function hoverInfo(name, roles) {
  const r = {
    zn: { title: 'Zn электроды', k: 'Рөлі', role: roles ? 'электрон береді (АНОД, тотығу).' : 'электрон береді.' },
    cu: { title: 'Cu электроды', k: 'Рөлі', role: roles ? 'электрон қабылданады (КАТОД, тотықсыздану).' : 'Cu²⁺ электрон қабылдайды.' },
    wire: { title: 'Сыртқы сым', k: 'Рөлі', role: 'электрондардың қозғалу жолы.' },
    bridge: { title: roles !== 'nobridge' ? 'Тұз көпірі' : 'U-түтік', k: 'Рөлі', role: 'иондардың қозғалу жолы.' },
    voltmeter: { title: 'Вольтметр', k: 'Рөлі', role: 'кернеуді өлшейді.' },
    znsol: { title: 'ZnSO₄ ерітіндісі', k: 'Рөлі', role: 'электролит, Zn²⁺ иондары жиналады.' },
    cusol: { title: 'CuSO₄ ерітіндісі', k: 'Рөлі', role: 'электролит, Cu²⁺ иондары бар.' },
  }
  return r[name]
}

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z)
const rand = (a, b) => a + Math.random() * (b - a)
const dummy = new THREE.Object3D()
const tmpColor = new THREE.Color()

/**
 * Толық Zn–Cu гальваникалық элементі (§15–§25).
 * Барлық күй useSim дүкенінен, кадр сайынғы мәндер `live` объектісінен оқылады.
 */
export default function GalvanicCell({
  onPick,
  showRoles = false,
  showNames = true,
  showMass = false,
  highlight = null,
  forceBridgeIons = false,
  driver = true,
  rig = true,
  interactive = true,
  bridgeName = true,
}) {
  const viewMode = useSim((s) => s.viewMode)
  const saltBridge = useSim((s) => s.saltBridge)
  const wire = useSim((s) => s.wire)
  const showCharges = useSim((s) => s.showCharges)
  const cameraMode = useSim((s) => s.cameraMode)
  const micro = viewMode === 'micro'
  const znRef = useRef()
  const cuRef = useRef()
  const cuSolMat = useRef()

  const pick = (name) => {
    play('click')
    if (onPick) return onPick(name)
    const st = useSim.getState()
    st.select(name)
    if (st.cameraMode === 'focus') st.focusOn(name)
  }
  const info = (n) => hoverInfo(n, n === 'bridge' && !bridgeName ? 'nobridge' : showRoles)
  const common = { onPick: pick, interactive }

  return (
    <group>
      {driver && <SimDriver />}
      {rig && <CameraRig />}

      <Beaker x={XL} />
      <Beaker x={XR} />
      <Solution x={XL} color={C.znSolution} name="znsol" info={info('znsol')} opacity={0.5} highlight={highlight === 'znsol'} {...common} />
      <Solution x={XR} color={C.cuSolution} name="cusol" info={info('cusol')} matRef={cuSolMat} opacity={0.5} highlight={highlight === 'cusol'} {...common} />
      <Electrode metal="zn" x={XL} groupRef={znRef} name="zn" info={info('zn')} highlight={highlight === 'zn'} {...common} />
      <Electrode metal="cu" x={XR} groupRef={cuRef} name="cu" info={info('cu')} highlight={highlight === 'cu'} {...common} />
      {wire && <Wire info={info('wire')} highlight={highlight === 'wire'} {...common} />}
      <VoltmeterLive info={info('voltmeter')} highlight={highlight === 'voltmeter'} {...common} />
      {saltBridge && (
        <DropIn from={1.6}>
          <SaltBridge info={info('bridge')} highlight={highlight === 'bridge'} {...common} />
        </DropIn>
      )}

      <ElectrodeScaler znRef={znRef} cuRef={cuRef} cuSolMat={cuSolMat} />
      {wire && <WireElectrons micro={micro} />}
      {micro && <Lattices znRef={znRef} cuRef={cuRef} />}
      {micro && <SolutionIons />}
      {(micro || forceBridgeIons) && saltBridge && <BridgeIons />}
      <ReactionEvents micro={micro} follow={cameraMode === 'follow'} znRef={znRef} cuRef={cuRef} />

      {showNames && (
        <>
          <Label position={[XL - 0.62, EL_TOP - 0.15, 0]} className="lbl big">
            Zn
          </Label>
          <Label position={[XR + 0.62, EL_TOP - 0.15, 0]} className="lbl big">
            Cu
          </Label>
          <Label position={[XL, 0.28, BEAKER_R + 0.05]}>ZnSO₄</Label>
          <Label position={[XR, 0.28, BEAKER_R + 0.05]}>CuSO₄</Label>
        </>
      )}
      {showRoles && (
        <>
          <Label position={[XL - 1.75, 1.9, 0]} className="role-tag anode">
            <span className="r">АНОД</span>
            <span className="p">ТОТЫҒУ</span>
          </Label>
          <Label position={[XR + 1.75, 1.9, 0]} className="role-tag cathode">
            <span className="r">КАТОД</span>
            <span className="p">ТОТЫҚСЫЗДАНУ</span>
          </Label>
        </>
      )}
      {micro && <Equations />}
      {showMass && <MassChips />}
      {showCharges && <ChargeMeters />}
      {highlight && <HighlightArrow name={highlight} />}
    </group>
  )
}

// ---------- Симуляция қозғалтқышы ----------
function SimDriver() {
  const acc = useRef(0)
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const st = useSim.getState()
    const speed = useApp.getState().settings.speed
    const k = dt * speed
    if (st.running && st.wire) {
      const raw = 1 - live.charge
      live.flow = raw < 0.07 ? 0 : raw
      live.progress = Math.min(1, live.progress + k * 0.022 * live.flow)
      if (st.saltBridge) {
        live.charge = Math.max(0, live.charge + k * (0.12 * live.flow - 1.3 * live.charge))
      } else {
        live.charge = Math.min(1, live.charge + k * 0.34 * live.flow)
      }
    } else {
      live.flow = 0
    }
    acc.current += rawDt
    if (acc.current > 0.1) {
      acc.current = 0
      const finished = live.progress >= 1
      const stalled = st.running && st.wire && !st.saltBridge && live.flow === 0
      useSim.setState({
        progress: live.progress,
        charge: live.charge,
        flow: live.flow,
        stalled,
        finished,
        followStep: live.followStep ?? 0,
        ...(finished && st.running ? { running: false } : {}),
      })
    }
  })
  return null
}

// ---------- Камера жүйесі: FREE / FOCUS / FOLLOW (§50) ----------
function CameraRig() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const focus = useSim((s) => s.focus)
  const nonce = useSim((s) => s.focusNonce)
  const mode = useSim((s) => s.cameraMode)
  const goal = useRef(null)
  const tmpT = useMemo(() => V(), [])
  const tmpP = useMemo(() => V(), [])
  const offset = useMemo(() => V(0.9, 0.75, 2.5), [])

  useEffect(() => {
    if (mode === 'focus') {
      const p = CAM_PRESETS[focus]
      if (p) goal.current = { pos: V(...p.pos), target: V(...p.target) }
    } else if (mode === 'free') {
      goal.current = null
    }
  }, [focus, nonce, mode])

  useFrame((_, dt) => {
    if (!controls) return
    const reduced = useApp.getState().settings.reducedMotion
    const k = 1 - Math.exp(-dt * (reduced ? 30 : 3.2))
    if (mode === 'follow' && live.trackPos) {
      tmpT.copy(live.trackPos)
      tmpP.copy(live.trackPos).add(offset)
      controls.target.lerp(tmpT, Math.min(1, k * 1.6))
      camera.position.lerp(tmpP, k)
      return
    }
    if (goal.current) {
      controls.target.lerp(goal.current.target, k)
      camera.position.lerp(goal.current.pos, k)
      if (camera.position.distanceTo(goal.current.pos) < 0.02) goal.current = null
    }
  })
  return null
}

// ---------- Вольтметр көрсеткіші ----------
function VoltmeterLive(props) {
  const reading = useSim((s) => {
    if (!s.wire || s.stalled) return '0.00'
    const v = s.saltBridge ? 1.1 - 0.04 * s.progress : 1.1 * s.flow
    return v.toFixed(2)
  })
  return <Voltmeter reading={reading} {...props} />
}

// ---------- Электрод массасының өзгеруі (§49) ----------
function ElectrodeScaler({ znRef, cuRef, cuSolMat }) {
  const c0 = useMemo(() => new THREE.Color(C.cuSolution), [])
  const c1 = useMemo(() => new THREE.Color('#cfe0f2'), [])
  useFrame(() => {
    const learning = useApp.getState().settings.learningMode
    const p = live.progress
    const amt = learning ? 0.5 : 0.07
    if (znRef.current) {
      const s = 1 - amt * p
      znRef.current.scale.set(s, 1, s)
    }
    if (cuRef.current) {
      const s = 1 + amt * 0.85 * p
      cuRef.current.scale.set(s, 1, s)
    }
    if (cuSolMat.current) {
      cuSolMat.current.color.copy(c0).lerp(c1, p * 0.8)
      cuSolMat.current.opacity = 0.55 - 0.2 * p
    }
  })
  return null
}

// ---------- Сыртқы сымдағы электрондар (InstancedMesh, §47) ----------
function WireElectrons({ micro }) {
  const visible = useSim((s) => s.running || s.progress > 0)
  const N = 18
  const core = useRef()
  const halo = useRef()
  const phase = useRef(0)
  const p = useMemo(() => V(), [])
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const speed = useApp.getState().settings.speed
    phase.current = (phase.current + dt * speed * 0.085 * live.flow) % 1
    const r = micro ? 1 : 0.7
    for (let i = 0; i < N; i++) {
      const u = (i / N + phase.current) % 1
      wireCurve.getPointAt(u, p)
      dummy.position.copy(p)
      dummy.scale.setScalar(r)
      dummy.updateMatrix()
      core.current.setMatrixAt(i, dummy.matrix)
      halo.current.setMatrixAt(i, dummy.matrix)
    }
    core.current.instanceMatrix.needsUpdate = true
    halo.current.instanceMatrix.needsUpdate = true
  })
  const setHover = useSim((s) => s.setHover)
  return (
    <group visible={visible}>
      <instancedMesh
        ref={core}
        args={[null, null, N]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(PARTICLE_INFO.e)
        }}
        onPointerOut={() => setHover(null)}
      >
        <sphereGeometry args={[0.072, 14, 14]} />
        <meshStandardMaterial color={C.electron} emissive={C.electron} emissiveIntensity={1.7} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={halo} args={[null, null, N]} raycast={() => null}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color={C.electronGlow} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  )
}

// ---------- Электрод атомдары (MICRO) ----------
function buildLattice() {
  const cols = 4
  const rows = 13
  const list = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const y = EL_Y0 + 0.12 + r * ((EL_H - 0.4) / (rows - 1))
      list.push({ cx: (c - (cols - 1) / 2) * 0.13, y, diss: y < SOL_TOP - 0.05 })
    }
  }
  const full = [...list.map((a) => ({ ...a, side: 1 })), ...list.map((a) => ({ ...a, side: -1 }))]
  const diss = full.map((a, i) => (a.diss ? i : -1)).filter((i) => i >= 0)
  diss.sort(() => Math.random() - 0.5)
  diss.forEach((idx, rank) => (full[idx].rank = rank))
  return { atoms: full, nDiss: diss.length }
}

function Lattices({ znRef, cuRef }) {
  const zn = useMemo(buildLattice, [])
  const cu = useMemo(buildLattice, [])
  const dep = useMemo(() => {
    const list = []
    for (let i = 0; i < 40; i++) {
      list.push({ cx: rand(-0.22, 0.22), y: rand(EL_Y0 + 0.1, SOL_TOP - 0.1), side: i % 2 ? 1 : -1, rank: i })
    }
    return list
  }, [])
  const znMesh = useRef()
  const cuMesh = useRef()
  const depMesh = useRef()
  const setHover = useSim((s) => s.setHover)

  useFrame(() => {
    const p = live.progress
    const zs = znRef.current?.scale.x ?? 1
    const cs = cuRef.current?.scale.x ?? 1
    const removed = Math.floor(p * zn.nDiss * 0.8)
    zn.atoms.forEach((a, i) => {
      const hidden = a.diss && a.rank < removed
      dummy.position.set(XL + a.cx * zs, a.y, a.side * ((EL_D / 2) * zs + 0.035))
      dummy.scale.setScalar(hidden ? 0 : 1)
      dummy.updateMatrix()
      znMesh.current.setMatrixAt(i, dummy.matrix)
    })
    znMesh.current.instanceMatrix.needsUpdate = true
    cu.atoms.forEach((a, i) => {
      dummy.position.set(XR + a.cx * cs, a.y, a.side * ((EL_D / 2) * cs + 0.035))
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      cuMesh.current.setMatrixAt(i, dummy.matrix)
    })
    cuMesh.current.instanceMatrix.needsUpdate = true
    const shown = Math.floor(p * dep.length)
    dep.forEach((a, i) => {
      dummy.position.set(XR + a.cx * cs, a.y, a.side * ((EL_D / 2) * cs + 0.1))
      dummy.scale.setScalar(a.rank < shown ? 1 : 0)
      dummy.updateMatrix()
      depMesh.current.setMatrixAt(i, dummy.matrix)
    })
    depMesh.current.instanceMatrix.needsUpdate = true
  })

  const hov = (info) => ({
    onPointerOver: (e) => {
      e.stopPropagation()
      setHover(info)
    },
    onPointerOut: () => setHover(null),
  })

  return (
    <group>
      <instancedMesh ref={znMesh} args={[null, null, zn.atoms.length]} {...hov(PARTICLE_INFO.zn)}>
        <sphereGeometry args={[0.064, 14, 14]} />
        <meshStandardMaterial color={C.znMetal} metalness={0.6} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={cuMesh} args={[null, null, cu.atoms.length]} {...hov(PARTICLE_INFO.cu)}>
        <sphereGeometry args={[0.064, 14, 14]} />
        <meshStandardMaterial color={C.cuMetal} metalness={0.6} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={depMesh} args={[null, null, dep.length]} {...hov(PARTICLE_INFO.cu)}>
        <sphereGeometry args={[0.066, 14, 14]} />
        <meshStandardMaterial color="#e38d4d" metalness={0.5} roughness={0.3} emissive="#7a3a10" emissiveIntensity={0.25} />
      </instancedMesh>
    </group>
  )
}

// ---------- Ерітіндідегі иондар — Brownian-style (§48) ----------
function makeHomes(cx, n) {
  const arr = []
  while (arr.length < n) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * 0.9
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (Math.abs(x) < 0.4 && Math.abs(z) < 0.2) continue // электродтан аулақ
    arr.push({
      x: cx + x,
      y: rand(0.2, SOL_TOP - 0.15),
      z,
      f: [rand(0.4, 1.1), rand(0.4, 1.1), rand(0.4, 1.1)],
      ph: [rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)],
    })
  }
  return arr
}

function SolutionIons() {
  const q = getQuality()
  const M = Math.round(26 * q.particles)
  const znH = useMemo(() => makeHomes(XL, M), [M])
  const cuH = useMemo(() => makeHomes(XR, M), [M])
  const znM = useRef()
  const cuM = useRef()
  const t = useRef(0)
  const setHover = useSim((s) => s.setHover)
  useFrame((_, dt) => {
    const st = useApp.getState().settings
    t.current += Math.min(dt, 0.05) * (st.reducedMotion ? 0.15 : 1)
    const amp = st.reducedMotion ? 0.03 : 0.13
    const p = live.progress
    const nZn = Math.round(M * (0.12 + 0.88 * p))
    const nCu = Math.round(M * (1 - 0.75 * p))
    const place = (mesh, homes, n) => {
      homes.forEach((h, i) => {
        const tt = t.current
        dummy.position.set(
          h.x + Math.sin(tt * h.f[0] + h.ph[0]) * amp,
          h.y + Math.sin(tt * h.f[1] + h.ph[1]) * amp,
          h.z + Math.sin(tt * h.f[2] + h.ph[2]) * amp
        )
        dummy.scale.setScalar(i < n ? 1 : 0)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    place(znM.current, znH, nZn)
    place(cuM.current, cuH, nCu)
  })
  const hov = (info) => ({
    onPointerOver: (e) => {
      e.stopPropagation()
      setHover(info)
    },
    onPointerOut: () => setHover(null),
  })
  return (
    <group>
      <instancedMesh ref={znM} args={[null, null, M]} {...hov(PARTICLE_INFO.zn2)}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color={C.zn2} roughness={0.35} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={cuM} args={[null, null, M]} {...hov(PARTICLE_INFO.cu2)}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color={C.cu2} roughness={0.3} emissive={C.cu2} emissiveIntensity={0.2} />
      </instancedMesh>
    </group>
  )
}

// ---------- Тұз көпіріндегі иондар: K⁺ (сфера) → катод, NO₃⁻ (октаэдр) → анод (§22) ----------
function BridgeIons() {
  const N = 11
  const k = useRef()
  const n = useRef()
  const st = useMemo(
    () => ({
      k: Array.from({ length: N }, (_, i) => ({ u: i / N, o: [rand(-0.07, 0.07), rand(-0.07, 0.07)] })),
      n: Array.from({ length: N }, (_, i) => ({ u: (i + 0.5) / N, o: [rand(-0.07, 0.07), rand(-0.07, 0.07)] })),
    }),
    []
  )
  const p = useMemo(() => V(), [])
  const setHover = useSim((s) => s.setHover)
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const sim = useSim.getState()
    const speed = useApp.getState().settings.speed
    const active = sim.running && (live.flow > 0 || live.charge > 0.04)
    const v = active ? dt * speed * (0.025 + 0.32 * live.charge) : 0
    const tt = state.clock.elapsedTime
    const put = (mesh, arr, dir) => {
      arr.forEach((a, i) => {
        a.u = (a.u + dir * v + 1) % 1
        bridgeCurve.getPointAt(a.u, p)
        dummy.position.set(p.x + a.o[0], p.y + a.o[1], p.z + a.o[0] * 0.8)
        dummy.rotation.set(tt * 0.8 + i, tt * 0.6, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    put(k.current, st.k, 1)
    put(n.current, st.n, -1)
  })
  const hov = (info) => ({
    onPointerOver: (e) => {
      e.stopPropagation()
      setHover(info)
    },
    onPointerOut: () => setHover(null),
  })
  return (
    <group>
      <instancedMesh ref={k} args={[null, null, N]} renderOrder={5} {...hov(PARTICLE_INFO.k)}>
        <sphereGeometry args={[0.068, 14, 14]} />
        <meshStandardMaterial color={C.cation} roughness={0.3} emissive={C.cation} emissiveIntensity={0.25} />
      </instancedMesh>
      <instancedMesh ref={n} args={[null, null, N]} renderOrder={5} {...hov(PARTICLE_INFO.no3)}>
        <octahedronGeometry args={[0.095]} />
        <meshStandardMaterial color={C.anion} roughness={0.35} flatShading emissive={C.anion} emissiveIntensity={0.2} />
      </instancedMesh>
    </group>
  )
}

// ---------- Реакция оқиғалары: Zn → Zn²⁺ + 2e⁻ ... Cu²⁺ + 2e⁻ → Cu (§16–§18) ----------
const SLOTS = 5 // 0-слот — бақыланатын электрон (§27)

function makeEvent(znS, cuS, tracked) {
  const A = V(XL + rand(-0.16, 0.16) * znS, rand(0.6, 1.5), (EL_D / 2) * znS + 0.045)
  const B = V(XR + rand(-0.16, 0.16) * cuS, rand(0.6, 1.5), (EL_D / 2) * cuS + 0.06)
  const P1 = V(A.x, EL_TOP - 0.3, A.z)
  const W0 = wireCurve.getPointAt(0)
  const W1 = wireCurve.getPointAt(1)
  const P2 = V(B.x, EL_TOP - 0.3, B.z)
  const path = new THREE.CurvePath()
  path.add(new THREE.LineCurve3(A, P1))
  path.add(new THREE.LineCurve3(P1, W0))
  path.add(wireCurve)
  path.add(new THREE.LineCurve3(W1, P2))
  path.add(new THREE.LineCurve3(P2, B))
  const L = path.getCurveLengths()
  const total = path.getLength()
  return {
    active: true,
    tracked,
    s: 0,
    A,
    B,
    path,
    f1: L[1] / total,
    f2: L[2] / total,
    zdir: V(rand(-0.35, 0.35), rand(-0.1, 0.25), 1).normalize(),
    I0: V(B.x + rand(-0.35, 0.35), B.y + rand(-0.3, 0.3), B.z + 0.75),
  }
}

function ReactionEvents({ micro, follow, znRef, cuRef }) {
  const slots = useRef(Array.from({ length: SLOTS }, () => ({ active: false })))
  const refs = useRef(Array.from({ length: SLOTS }, () => ({})))
  const timer = useRef(0)
  const lastSnd = useRef(0)
  const znC = useMemo(() => new THREE.Color(C.znMetal), [])
  const zn2C = useMemo(() => new THREE.Color(C.zn2), [])
  const cu2C = useMemo(() => new THREE.Color(C.cu2), [])
  const cuC = useMemo(() => new THREE.Color(C.cuMetal), [])
  const tmp = useMemo(() => V(), [])
  const tmp2 = useMemo(() => V(), [])
  const trackVec = useMemo(() => V(), [])

  useEffect(() => {
    if (!follow) {
      slots.current[0].active = false
      live.trackPos = null
    }
  }, [follow])
  useEffect(() => {
    if (!micro) for (let i = 1; i < SLOTS; i++) slots.current[i].active = false
  }, [micro])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const sim = useSim.getState()
    const speed = useApp.getState().settings.speed
    const k = sim.running ? dt * speed * live.flow : 0
    const znS = znRef.current?.scale.x ?? 1
    const cuS = cuRef.current?.scale.x ?? 1
    live.anodePulse = 0
    live.cathodePulse = 0

    // жаңа оқиға
    if (follow && !slots.current[0].active) slots.current[0] = makeEvent(znS, cuS, true)
    if (micro && k > 0) {
      timer.current += k
      if (timer.current > 1.25) {
        timer.current = 0
        const free = slots.current.findIndex((s, i) => i > 0 && !s.active)
        if (free > 0) slots.current[free] = makeEvent(znS, cuS, false)
      }
    }

    for (let i = 0; i < SLOTS; i++) {
      const d = slots.current[i]
      const r = refs.current[i]
      if (!r.root) continue
      if (!d.active) {
        r.root.visible = false
        continue
      }
      r.root.visible = true
      d.s += k * (d.tracked ? 0.1 : 0.17)
      const s = d.s

      // Zn атомы → Zn²⁺ ионы ерітіндіге өтеді
      const detach = smooth(0.03, 0.32, s)
      tmp.copy(d.A).addScaledVector(d.zdir, 0.8 * detach)
      r.zn.position.copy(tmp)
      r.zn.scale.setScalar(s < 0.4 ? 1 : 1 - smooth(0.4, 0.52, s))
      r.znMat.color.copy(znC).lerp(zn2C, smooth(0.04, 0.14, s))
      r.znMat.emissiveIntensity = s > 0.02 && s < 0.16 ? 0.6 : 0

      // 2 электрон: алдымен электродта қалады, кейін сым арқылы Cu-ға
      const appear = smooth(0.03, 0.11, s)
      let e1, e2
      if (s < 0.12) {
        e1 = tmp.copy(d.A).add(tmp2.set(0.07, 0.04, 0.02))
        r.e1.position.copy(e1)
        r.e2.position.copy(d.A).add(tmp2.set(-0.07, -0.04, 0.02))
      } else if (s < 0.8) {
        const u = clamp01((s - 0.12) / 0.68)
        d.path.getPoint(u, r.e1.position)
        d.path.getPoint(Math.max(0, u - 0.03), r.e2.position)
      } else {
        const m = smooth(0.8, 0.9, s)
        r.e1.position.lerp(r.cu.position, m * 0.25)
        r.e2.position.lerp(r.cu.position, m * 0.25)
      }
      const eScale = appear * (1 - smooth(0.87, 0.92, s))
      r.e1.scale.setScalar(Math.max(0.0001, eScale))
      r.e2.scale.setScalar(Math.max(0.0001, eScale))

      // Cu²⁺ ионы электродқа келіп, Cu атомына айналады
      const approach = smooth(0.52, 0.84, s)
      r.cu.position.copy(d.I0).lerp(d.B, approach)
      if (s < 0.84) r.cu.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.03 * (1 - approach)
      r.cu.scale.setScalar(smooth(0.2, 0.32, s) * (1 - smooth(0.95, 1, s)))
      r.cuMat.color.copy(cu2C).lerp(cuC, smooth(0.84, 0.92, s))
      r.cuMat.emissiveIntensity = s > 0.82 && s < 0.95 ? 0.7 : 0.15

      if (s > 0.02 && s < 0.18) live.anodePulse = 1
      if (s > 0.8 && s < 0.96) live.cathodePulse = 1

      if (d.tracked) {
        live.trackPos = trackVec.copy(r.e1.position)
        live.trackS = s
        let step = 0
        if (s >= 0.8) step = 4
        else if (s >= 0.12) {
          const u = (s - 0.12) / 0.68
          step = u < d.f1 ? 1 : u < d.f2 ? 2 : 3
        }
        live.followStep = step
      }
      if (s >= 1) {
        if (d.tracked) slots.current[i] = makeEvent(znS, cuS, true)
        else d.active = false
        if (state.clock.elapsedTime - lastSnd.current > 0.6) {
          play('electron')
          lastSnd.current = state.clock.elapsedTime
        }
      }
    }
  })

  const tex = useMemo(getGlowTexture, [])
  return (
    <group>
      {Array.from({ length: SLOTS }, (_, i) => (
        <group key={i} ref={(g) => (refs.current[i].root = g)} visible={false}>
          <mesh ref={(m) => (refs.current[i].zn = m)}>
            <sphereGeometry args={[0.09, 18, 18]} />
            <meshStandardMaterial ref={(m) => (refs.current[i].znMat = m)} color={C.znMetal} emissive="#ffffff" emissiveIntensity={0} />
          </mesh>
          <mesh ref={(m) => (refs.current[i].cu = m)}>
            <sphereGeometry args={[0.09, 18, 18]} />
            <meshStandardMaterial ref={(m) => (refs.current[i].cuMat = m)} color={C.cu2} emissive="#ffffff" emissiveIntensity={0.15} />
          </mesh>
          {['e1', 'e2'].map((key) => (
            <group key={key} ref={(g) => (refs.current[i][key] = g)}>
              <mesh>
                <sphereGeometry args={[i === 0 ? 0.085 : 0.07, 16, 16]} />
                <meshStandardMaterial color={C.electron} emissive={C.electron} emissiveIntensity={1.8} toneMapped={false} />
              </mesh>
              <sprite scale={[0.42, 0.42, 1]}>
                <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
              </sprite>
              {i === 0 && key === 'e1' && (
                <Html zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }} position={[0, 0.2, 0]}>
                  <div className="lbl mono" style={{ background: C.electron, color: '#fff' }}>
                    e⁻
                  </div>
                </Html>
              )}
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

// ---------- Теңдеулер (MICRO) ----------
function Equations() {
  const a = useRef()
  const c = useRef()
  useFrame(() => {
    if (a.current) a.current.classList.toggle('pulse', live.anodePulse > 0)
    if (c.current) c.current.classList.toggle('pulse', live.cathodePulse > 0)
  })
  const hide = useApp((s) => s.settings.hideLabels)
  if (hide) return null
  return (
    <>
      <Html position={[XL - 0.3, 5.05, 0]} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={a} className="eq">
          Zn → <span className="zn2">Zn²⁺</span> + <span className="e">2e⁻</span>
        </div>
      </Html>
      <Html position={[XR + 0.3, 5.05, 0]} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={c} className="eq">
          <span className="cu2">Cu²⁺</span> + <span className="e">2e⁻</span> → Cu
        </div>
      </Html>
    </>
  )
}

// ---------- Масса (§16) ----------
function MassChips() {
  const p = useSim((s) => s.progress)
  const dm = 1.6 * p
  return (
    <>
      <Label position={[XL, -0.35, BEAKER_R + 0.2]} className="mass-chip" always>
        <small>Zn массасы</small>
        {(10 - dm).toFixed(2)} g
      </Label>
      <Label position={[XR, -0.35, BEAKER_R + 0.2]} className="mass-chip" always>
        <small>Cu массасы</small>
        {(10 + (dm * 63.55) / 65.38).toFixed(2)} g
      </Label>
    </>
  )
}

// ---------- Charge Balance (§23) ----------
function ChargeMeters() {
  const charge = useSim((s) => s.charge)
  const n = Math.round(charge * 6)
  return (
    <>
      <Label position={[XL, 3.2, -1.2]} className="charge-meter" always>
        <div className="t">АНОД ЖАҒЫ</div>
        <div className="s plus">{n ? Array(n).fill('+').join(' ') : ''}</div>
        {!n && <div className="ok">тепе-тең ✓</div>}
      </Label>
      <Label position={[XR, 3.2, -1.2]} className="charge-meter" always>
        <div className="t">КАТОД ЖАҒЫ</div>
        <div className="s minus">{n ? Array(n).fill('−').join(' ') : ''}</div>
        {!n && <div className="ok">тепе-тең ✓</div>}
      </Label>
    </>
  )
}

const ARROW_POS = {
  zn: [XL, EL_TOP + 0.5, 0.3],
  cu: [XR, EL_TOP + 0.5, 0.3],
  wire: [-1.2, 4.75, 0],
  bridge: [0, 3.95, BRIDGE_Z],
  voltmeter: [0, 5.1, 0],
  znsol: [XL, 2.1, 1.0],
  cusol: [XR, 2.1, 1.0],
}
function HighlightArrow({ name }) {
  const pos = ARROW_POS[name]
  if (!pos) return null
  return (
    <Html position={pos} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
      <div className="hint-arrow">▼</div>
    </Html>
  )
}
