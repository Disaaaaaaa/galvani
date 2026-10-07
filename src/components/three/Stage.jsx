import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Lightformer, AdaptiveDpr } from '@react-three/drei'
import { useApp } from '../../store/useApp'

// Құрылғы сапасы (§54): mobile-да бөлшек азаяды, көлеңке сапасы төмендейді
export function getQuality() {
  if (typeof window === 'undefined') return { mobile: false, particles: 1 }
  const mobile =
    window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches
  return { mobile, particles: mobile ? 0.55 : 1 }
}

export function useQuality() {
  return useMemo(getQuality, [])
}

/**
 * Барлық 3D сахналардың ортақ негізі.
 * Desktop: mouse drag — айналдыру, scroll — zoom, click — таңдау.
 * Mobile: бір саусақ — айналдыру, pinch — zoom, tap — таңдау (§55).
 */
export default function Stage({
  children,
  camera = { position: [6, 5, 9], fov: 40 },
  target = [0, 1.5, 0],
  controls = true,
  minDistance = 3,
  maxDistance = 22,
  autoRotate = false,
  shadows = true,
  floor = true,
  floorY = 0,
  ariaLabel = '3D көрініс',
  onPointerMissed,
}) {
  const { mobile } = useQuality()
  const reduced = useApp((s) => s.settings.reducedMotion)

  return (
    <div className="stage" role="img" aria-label={ariaLabel}>
      <Canvas
        shadows={shadows && !mobile}
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={camera}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerMissed={onPointerMissed}
      >
        <AdaptiveDpr pixelated={false} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#ffffff', '#c9d6ea', 0.6]} />
        <directionalLight
          position={[5, 9, 6]}
          intensity={1.4}
          castShadow={shadows && !mobile}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#dbeafe" />
        {/* Металл беттері үшін жергілікті env-map — сырттан жүктеу жоқ */}
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2.2} position={[0, 5, -4]} scale={[10, 3, 1]} />
          <Lightformer intensity={1.2} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer intensity={1.2} position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#e0f2fe" />
          <Lightformer intensity={0.6} position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#cbd5e1" />
        </Environment>
        <Suspense fallback={null}>{children}</Suspense>
        {floor && (
          <ContactShadows
            position={[0, floorY + 0.001, 0]}
            opacity={0.35}
            scale={22}
            blur={2.4}
            far={6}
            resolution={mobile ? 256 : 512}
            frames={mobile ? 1 : Infinity}
          />
        )}
        {controls && (
          <OrbitControls
            makeDefault
            target={target}
            enableDamping
            dampingFactor={0.08}
            minDistance={minDistance}
            maxDistance={maxDistance}
            maxPolarAngle={Math.PI * 0.49}
            autoRotate={autoRotate && !reduced}
            autoRotateSpeed={0.6}
            enablePan={!mobile}
          />
        )}
      </Canvas>
    </div>
  )
}
