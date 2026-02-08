import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFireflyStore } from '../stores/fireflyStore'
import { mushroomWorldPos } from '../stores/mushroomPosition'
import { THROW } from '../constants'
import { lerpOpacity } from '../utils/helpers'
import styles from './GiftIndicator.module.css'

const WARM = new THREE.Color('#ffcc66')
const SEGS = 32
const GIFT_LERP_RATE = 0.08

export default function GiftIndicator() {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const htmlRef = useRef<HTMLDivElement>(null)

  useFrame(({ clock }) => {
    if (!ringRef.current || !glowRef.current || !groupRef.current) return
    groupRef.current.position.x = x + mushroomWorldPos.x
    const { jarCount, phase, pressing } = useFireflyStore.getState()
    const show = jarCount > 0 && phase === 'scooping' && !pressing

    const ringTarget = show ? 0.45 : 0
    const glowTarget = show ? 0.15 : 0
    lerpOpacity(ringRef.current.material as THREE.MeshBasicMaterial, ringTarget, GIFT_LERP_RATE)
    lerpOpacity(glowRef.current.material as THREE.MeshBasicMaterial, glowTarget, GIFT_LERP_RATE)

    if (show) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.04
      ringRef.current.scale.setScalar(pulse)
      glowRef.current.scale.setScalar(pulse * 1.2)
    }

    if (htmlRef.current) {
      const opacity = (ringRef.current.material as THREE.MeshBasicMaterial).opacity
      htmlRef.current.style.opacity = String(Math.min(1, opacity * 4))
    }
  })

  const [x, y, z] = THROW.mouthPos
  const r = THROW.hitRadius * 0.85
  const ringMat = <meshBasicMaterial color={WARM} transparent opacity={0} depthWrite={false} depthTest={false} />

  return (
    <group ref={groupRef} position={[x, y, z + 0.04]} renderOrder={99}>
      <mesh ref={glowRef}>
        <circleGeometry args={[r * 1.1, SEGS]} />
        {ringMat}
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[r - 0.015, r, SEGS]} />
        {ringMat}
      </mesh>
      <Html center position={[0, r + 0.15, 0]} className={styles.htmlWrapper}>
        <div ref={htmlRef} className={styles.dropLabel}>
          tap to gift
        </div>
      </Html>
    </group>
  )
}
