import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFireflyStore } from '../stores/fireflyStore'
import { JAR } from '../constants'
import { screenToWorld } from '../utils/camera'
import { Jar } from '../config'
import styles from './JarProjectile.module.css'

export default function JarProjectile() {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.MeshStandardMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const { camera } = useThree()
  const jarCount = useFireflyStore((s) => s.jarCount)
  const phase = useFireflyStore((s) => s.phase)

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const store = useFireflyStore.getState()

    if (store.phase !== 'scooping') {
      g.visible = false
      return
    }

    const pos = screenToWorld(
      store.dragX / window.innerWidth,
      store.dragY / window.innerHeight,
      camera,
      JAR.dragZ,
    )
    g.visible = true
    g.position.copy(pos)
    g.scale.setScalar(JAR.jarScale)

    const count = store.jarCount
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = 0.5 + count * 0.5
      glowRef.current.opacity = Math.min(0.95, 0.5 + count * 0.06)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + count * 0.6
      lightRef.current.distance = 2 + count * 0.5
    }
  })

  return (
    <group ref={groupRef} visible={false} scale={JAR.jarScale}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.6, 1.2, 12]} />
        <meshStandardMaterial
          ref={glowRef}
          color={Jar.colors.body}
          emissive={Jar.colors.emissive}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.2, 12]} />
        <meshStandardMaterial color={Jar.colors.cap} roughness={0.3} />
      </mesh>
      <pointLight ref={lightRef} color={Jar.colors.light} intensity={0.4} distance={2} />
      {jarCount > 0 && phase === 'scooping' && (
        <Html center position={[0, 1.2, 0]} className={styles.htmlWrapper}>
          <div className={styles.badge}>
            {jarCount}
          </div>
        </Html>
      )}
    </group>
  )
}
