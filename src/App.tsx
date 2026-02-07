import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import HUD from './ui/HUD'
import { useMushroomStore } from './stores/mushroomStore'

export default function App() {
  const evolution = useMushroomStore((s) => s.evolution)
  const isDark = evolution === 'dark' || evolution === 'demonic'

  return (
    <>
      {/* Background image fixed to viewport */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/forest-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          filter: isDark ? 'brightness(0.4) saturate(0.6)' : 'brightness(1) saturate(1)',
          transition: 'filter 1s ease-in-out',
          zIndex: -1,
        }}
      />
      {/* Dark overlay for dark mode */}
      {isDark && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(20, 30, 40, 0.5)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Scene />
      </Canvas>
      <HUD />
    </>
  )
}
