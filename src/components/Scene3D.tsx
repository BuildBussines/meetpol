import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
// Knot glides between a big hero pose and a small corner pose by route; mouse adds parallax.
function Knot({ hero }: { hero: boolean }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((s, dt) => {
    const t = hero ? { x: 1.8, y: 0, z: 0, k: 1 } : { x: 3.6, y: -1.8, z: -3, k: 0.55 }
    const k = Math.min(1, dt * 2), p = g.current.position
    p.x += (t.x + s.pointer.x * 0.4 - p.x) * k; p.y += (t.y + s.pointer.y * 0.3 - p.y) * k; p.z += (t.z - p.z) * k
    g.current.scale.setScalar(g.current.scale.x + (t.k - g.current.scale.x) * k)
    g.current.rotation.y += dt * 0.3
  })
  return (<group ref={g}><Float speed={2} floatIntensity={1.2}>
    <mesh><torusKnotGeometry args={[1, 0.32, 200, 32]} /><MeshDistortMaterial color="#c8f432" distort={0.35} speed={2} roughness={0.15} metalness={0.6} /></mesh>
    <mesh position={[-2.6, 1.4, -1]}><icosahedronGeometry args={[0.45, 0]} /><meshStandardMaterial color="#ffffff" flatShading /></mesh>
    <mesh position={[-2.2, -1.5, 0.5]}><octahedronGeometry args={[0.35]} /><meshStandardMaterial color="#6d8a1a" flatShading /></mesh>
  </Float></group>)
}
export default function Scene3D({ hero }: { hero: boolean }) {
  return <div className="scene"><Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
    <ambientLight intensity={0.6} /><directionalLight position={[4, 5, 5]} intensity={2} /><pointLight position={[-5, -3, 2]} color="#ffffff" intensity={30} />
    <Stars radius={60} depth={40} count={1500} factor={3} fade speed={1} /><Knot hero={hero} /></Canvas></div>
}
