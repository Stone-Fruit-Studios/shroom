import { useMemo } from 'react'
import * as THREE from 'three'

interface ForegroundFrameProps {
  isDark?: boolean
}

export default function ForegroundFrame({ isDark = false }: ForegroundFrameProps) {
  // Create gradient texture for left and right edges
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    // Create gradient from dark (left) to transparent (right)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)')
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  if (!gradientTexture) return null

  return (
    <group>
      {/* Left edge frame */}
      <mesh
        position={[-8, 0, 3]}
        renderOrder={1000}
      >
        <planeGeometry args={[6, 12]} />
        <meshBasicMaterial
          map={gradientTexture}
          transparent
          opacity={isDark ? 0.9 : 0.7}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right edge frame */}
      <mesh
        position={[8, 0, 3]}
        rotation={[0, Math.PI, 0]}
        renderOrder={1000}
      >
        <planeGeometry args={[6, 12]} />
        <meshBasicMaterial
          map={gradientTexture}
          transparent
          opacity={isDark ? 0.9 : 0.7}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
