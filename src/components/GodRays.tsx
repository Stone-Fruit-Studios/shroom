import * as THREE from 'three'

interface GodRaysProps {
  position?: [number, number, number]
  intensity?: number
  isDark?: boolean
}

export default function GodRays({
  position = [0, 5, -5],
  intensity = 2,
  isDark = false,
}: GodRaysProps) {
  return (
    <spotLight
      position={position}
      angle={0.5}
      penumbra={0.5}
      intensity={isDark ? intensity * 0.5 : intensity}
      color={isDark ? '#40a898' : '#ffe8c0'}
      castShadow={false}
      distance={30}
      decay={2}
    />
  )
}
