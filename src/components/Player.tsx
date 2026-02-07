import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const SPEED = 5
const JUMP_FORCE = 5

export default function Player() {
  const rigidBody = useRef<RapierRigidBody>(null)
  const [, getKeys] = useKeyboardControls()

  useFrame(() => {
    if (!rigidBody.current) return

    const { forward, backward, left, right, jump } = getKeys()

    const impulse = new THREE.Vector3()
    if (forward) impulse.z -= SPEED
    if (backward) impulse.z += SPEED
    if (left) impulse.x -= SPEED
    if (right) impulse.x += SPEED

    impulse.multiplyScalar(0.02)
    rigidBody.current.applyImpulse(impulse, true)

    if (jump) {
      const vel = rigidBody.current.linvel()
      if (Math.abs(vel.y) < 0.1) {
        rigidBody.current.applyImpulse(
          new THREE.Vector3(0, JUMP_FORCE, 0),
          true,
        )
      }
    }
  })

  return (
    <RigidBody ref={rigidBody} colliders="ball" position={[0, 2, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#e8d5b7" />
      </mesh>
      {/* Mushroom cap */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
    </RigidBody>
  )
}
