import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'

/**
 * Rear-plane decoration for the hero: sandwich ingredients cut from flat ink (unlit materials, so they
 * read as pasted paper layers, not glossy 3D), drifting slowly and leaning toward the pointer.
 * Kept to the right half of the frame so it never sits behind the headline.
 */

type Kind = 'tomato' | 'pickle' | 'onion' | 'sesame' | 'mustard' | 'pepper'

interface Piece {
  kind: Kind
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  speed: number
  phase: number
}

const INK = {
  tomato: '#e8482c',
  tomatoFlesh: '#f47a5f',
  pickle: '#8fb35a',
  pickleFlesh: '#c9dd8f',
  onion: '#efe1f0',
  sesame: '#fffdf8',
  mustard: '#f4b41a',
  pepper: '#15201b',
}

/** Deterministic PRNG so the composition is identical on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePieces(count: number): Piece[] {
  const random = mulberry32(42)
  const kinds: Kind[] = ['tomato', 'pickle', 'sesame', 'onion', 'mustard', 'sesame', 'pepper', 'tomato', 'pickle', 'sesame']
  return Array.from({ length: count }, (_, i) => {
    // Right half only: the headline column on the left always stays clear.
    const x = 2 + random() * 6.5
    return {
      kind: kinds[i % kinds.length],
      // Between the navigation and the ticker band (the camera sees about ±3.45 units at z = 0).
      position: [x, -2.5 + random() * 4.9, -3.5 + random() * 3.5],
      // Face the camera (cylinders lie along Y, so tip them 90° on X) with a little tilt.
      rotation: [Math.PI / 2 + (random() - 0.5) * 0.9, (random() - 0.5) * 0.9, random() * Math.PI * 2],
      scale: 0.7 + random() * 0.7,
      speed: 0.15 + random() * 0.35,
      phase: random() * Math.PI * 2,
    }
  })
}

function Ingredient({ piece }: { piece: Piece }) {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    const group = ref.current
    if (!group) return
    const t = clock.getElapsedTime() * piece.speed + piece.phase
    // Spin in the picture plane and wobble gently, so slices stay readable as round cut-outs.
    group.rotation.x = piece.rotation[0] + Math.sin(t * 0.7) * 0.25
    group.rotation.y = piece.rotation[1] + Math.cos(t * 0.5) * 0.25
    group.rotation.z = piece.rotation[2] + t * 0.35
    group.position.y = piece.position[1] + Math.sin(t) * 0.3
  })

  return (
    <group ref={ref} position={piece.position} rotation={piece.rotation} scale={piece.scale}>
      {piece.kind === 'tomato' && (
        <>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.12, 40]} />
            <meshBasicMaterial color={INK.tomato} />
          </mesh>
          <mesh position={[0, 0.002, 0]}>
            <cylinderGeometry args={[0.43, 0.43, 0.125, 40]} />
            <meshBasicMaterial color={INK.tomatoFlesh} />
          </mesh>
        </>
      )}
      {piece.kind === 'pickle' && (
        <>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.09, 9]} />
            <meshBasicMaterial color={INK.pickle} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.095, 24]} />
            <meshBasicMaterial color={INK.pickleFlesh} />
          </mesh>
        </>
      )}
      {piece.kind === 'onion' && (
        <mesh>
          <torusGeometry args={[0.38, 0.07, 10, 40]} />
          <meshBasicMaterial color={INK.onion} />
        </mesh>
      )}
      {piece.kind === 'sesame' && (
        <mesh scale={[0.14, 0.07, 0.08]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color={INK.sesame} />
        </mesh>
      )}
      {piece.kind === 'mustard' && (
        <mesh>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshBasicMaterial color={INK.mustard} />
        </mesh>
      )}
      {piece.kind === 'pepper' && (
        <mesh>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshBasicMaterial color={INK.pepper} />
        </mesh>
      )}
    </group>
  )
}

function Scene({ count }: { count: number }) {
  const pieces = useMemo(() => makePieces(count), [count])
  const ref = useRef<Group>(null)
  // The canvas ignores pointer events (content stays clickable), so read the pointer from the window.
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  useFrame(() => {
    const group = ref.current
    if (!group) return
    group.rotation.y += (pointer.current.x * 0.14 - group.rotation.y) * 0.04
    group.rotation.x += (pointer.current.y * 0.09 - group.rotation.x) * 0.04
  })
  return (
    <group ref={ref}>
      {pieces.map((piece, i) => (
        <Ingredient key={i} piece={piece} />
      ))}
    </group>
  )
}

export default function HeroScene({ count = 26 }: { count?: number }) {
  const container = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  // Pause rendering whenever the hero is scrolled out of view.
  useEffect(() => {
    const node = container.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={container} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene count={count} />
      </Canvas>
    </div>
  )
}
