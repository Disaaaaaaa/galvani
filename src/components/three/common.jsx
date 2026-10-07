import { useState, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useApp } from '../../store/useApp'
import { useSim } from '../../store/useSim'
import { C } from '../../lib/colors'

/** 3D кеңістіктегі HTML белгі. Мұғалімнің «Барлық белгілерді жасыру» режимін сақтайды (§67). */
export function Label({ position, children, className = 'lbl', always = false, style }) {
  const hide = useApp((s) => s.settings.hideLabels)
  if (hide && !always) return null
  return (
    <Html position={position} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
      <div className={className} style={style}>
        {children}
      </div>
    </Html>
  )
}

/** Hover → outline + tooltip, click → таңдау (§51) */
export function useHoverable(info, name, onPick, enabled = true) {
  const [hovered, setHovered] = useState(false)
  const setHover = useSim((s) => s.setHover)
  const hideLabels = useApp((s) => s.settings.hideLabels)
  if (!enabled) return [false, {}]
  const handlers = {
    onPointerOver: (e) => {
      e.stopPropagation()
      setHovered(true)
      if (info && !hideLabels) setHover(info)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      setHovered(false)
      setHover(null)
      document.body.style.cursor = ''
    },
    onClick: (e) => {
      e.stopPropagation()
      onPick?.(name, e)
    },
  }
  return [hovered, handlers]
}

let glowTex = null
export function getGlowTexture() {
  if (glowTex) return glowTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, 'rgba(160,240,255,0.85)')
  grd.addColorStop(0.6, 'rgba(18,200,245,0.25)')
  grd.addColorStop(1, 'rgba(18,200,245,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  glowTex = new THREE.CanvasTexture(c)
  return glowTex
}

/** Жарқыраған электрон (§17): көк-ақ сфера + жарқыл */
export function Electron({ radius = 0.08, glow = 3.2, ...props }) {
  const tex = useMemo(getGlowTexture, [])
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial color={C.electron} emissive={C.electron} emissiveIntensity={1.6} roughness={0.2} toneMapped={false} />
      </mesh>
      <sprite scale={[radius * glow * 2, radius * glow * 2, 1]}>
        <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

export const electronMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: C.electron,
    emissive: C.electron,
    emissiveIntensity: 1.6,
    roughness: 0.2,
    toneMapped: false,
  })

export function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}
export function smooth(a, b, t) {
  const x = clamp01((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}
