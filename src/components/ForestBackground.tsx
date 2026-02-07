import { useTexture } from '@react-three/drei'
import { Suspense } from 'react'

interface ForestBackgroundProps {
  isDark?: boolean
}

function BackgroundSphere({ isDark }: { isDark: boolean }) {
  const texture = useTexture('/forest-background.png')

  // Calculate aspect ratio to maintain image proportions
  const image = texture.image as HTMLImageElement
  const aspect = image.width / image.height
  const height = 20
  const width = height * aspect

  return (
    <mesh position={[0, 0, -15]} rotation={[0, 0, 0]}>
      {/* Large plane positioned behind the scene */}
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        fog={false}
        toneMapped={false}
        opacity={isDark ? 0.6 : 1}
        transparent={isDark}
      />
    </mesh>
  )
}

export default function ForestBackground({
  isDark = false,
}: ForestBackgroundProps) {
  return (
    <Suspense fallback={null}>
      <BackgroundSphere isDark={isDark} />
    </Suspense>
  )
}
