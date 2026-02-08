import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFeedingStore } from '../stores/feedingStore'
import { mushroomWorldPos } from '../stores/mushroomPosition'
import { THROW } from '../constants'
import { lerpOpacity } from '../utils/helpers'

const WHITE = new THREE.Color('#ffffff')
const SEGS = 48

export default function TargetReticle() {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ringRef.current || !glowRef.current || !groupRef.current) return
    groupRef.current.position.x = x + mushroomWorldPos.x
    const { isDragging } = useFeedingStore.getState()

    const ringTarget = isDragging ? 0.3 : 0
    const glowTarget = isDragging ? 0.08 : 0

    lerpOpacity(ringRef.current.material as THREE.MeshBasicMaterial, ringTarget)
    lerpOpacity(glowRef.current.material as THREE.MeshBasicMaterial, glowTarget)

    const pulse = 1 + Math.sin(clock.elapsedTime * 4) * 0.06
    ringRef.current.scale.setScalar(pulse)
    glowRef.current.scale.setScalar(pulse * 1.15)
  })

  const [x, y, z] = THROW.mouthPos
  const r = THROW.hitRadius * 0.4
  const mat = <meshBasicMaterial color={WHITE} transparent opacity={0} depthWrite={false} depthTest={false} />

  return (
    <group ref={groupRef} position={[x, y, z + 0.05]} renderOrder={100}>
      <mesh ref={glowRef}>
        <circleGeometry args={[r * 1.2, SEGS]} />
        {mat}
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[r - 0.01, r, SEGS]} />
        {mat}
      </mesh>
    </group>
  )
}
