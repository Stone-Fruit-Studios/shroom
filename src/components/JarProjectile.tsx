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
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + count * 0.6
      lightRef.current.distance = 2 + count * 0.5
    }
  })

  return (
    <group ref={groupRef} visible={false} scale={JAR.jarScale}>
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
