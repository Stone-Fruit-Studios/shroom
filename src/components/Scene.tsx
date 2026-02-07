import { Environment, OrbitControls } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import Player from './Player'

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Environment preset="forest" />
      <OrbitControls makeDefault />

      <Player />

      {/* Ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[50, 1, 50]} />
          <meshStandardMaterial color="#3a7d44" />
        </mesh>
      </RigidBody>
    </>
  )
}
