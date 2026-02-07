import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MistLayerProps {
  isDark?: boolean
}

// Simple noise function for procedural texture
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export default function MistLayer({ isDark = false }: MistLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  // Create noise texture
  const noiseTexture = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    const imageData = ctx.createImageData(size, size)
    const data = imageData.data

    // Generate noise
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const value = noise(x * 0.01, y * 0.01) * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
    return texture
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current || !noiseTexture) return

    const t = clock.elapsedTime

    // Slow drift in X and Y
    meshRef.current.position.x = Math.sin(t * 0.1) * 0.5
    meshRef.current.position.y = Math.cos(t * 0.15) * 0.3

    // Scroll the noise texture
    noiseTexture.offset.x = t * 0.02
    noiseTexture.offset.y = t * 0.015
  })

  if (!noiseTexture) return null

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} renderOrder={-1}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial
        ref={materialRef}
        map={noiseTexture}
        transparent
        opacity={isDark ? 0.15 : 0.1}
        color={isDark ? '#4080a0' : '#88ddff'}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}
