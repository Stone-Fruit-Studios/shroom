import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingMotesProps {
  count?: number
  size?: number
  speed?: number
  spread?: number
  color?: string
  isDark?: boolean
}

export default function FloatingMotes({
  count = 300,
  size = 0.02,
  speed = 0.3,
  spread = 20,
  color = '#88ddff',
  isDark = false,
}: FloatingMotesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // Generate random positions and velocities
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = Math.random() * 10 - 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      // Velocity (slow upward drift)
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02

      // Size variation
      sizes[i] = Math.random() * size + size * 0.5
    }

    return { positions, velocities, sizes }
  }, [count, spread, size])

  // Animate particles
  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < count; i++) {
      // Update positions
      positions[i * 3] += particles.velocities[i * 3] * speed * delta * 60
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * speed * delta * 60
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * speed * delta * 60

      // Wrap around when particles drift too far
      if (positions[i * 3 + 1] > 8) {
        positions[i * 3 + 1] = -2
      }
      if (Math.abs(positions[i * 3]) > spread / 2) {
        positions[i * 3] = (Math.random() - 0.5) * spread
      }
      if (Math.abs(positions[i * 3 + 2]) > spread / 2) {
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={isDark ? '#60c8b0' : color}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
