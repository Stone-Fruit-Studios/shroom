import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import HUD from './ui/HUD'
import { useMultiplayer } from './hooks/useMultiplayer'

export default function App() {
  const { ready } = useMultiplayer()

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a1a',
        color: '#7a6f9a',
        fontFamily: 'monospace',
        fontSize: '1.2rem',
      }}>
        Connecting...
      </div>
    )
  }

  return (
    <>
      <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 45 }}>
        <Scene />
      </Canvas>
      <HUD />
    </>
  )
}
