import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Clouds, Cloud } from '@react-three/drei'
import * as THREE from 'three'
import { useMushroomStore } from '../stores/mushroomStore'
import { LERP } from '../constants'
import type { EvolutionState } from '../types'
import { Env, Color } from '../config'

// Ground mounds — very gentle raised terrain banks far from center, creating wide forest path
const GROUND_MOUNDS: { position: [number, number, number]; scale: [number, number, number]; rotation?: number }[] = [
  // --- Left bank (far out, very low/wide) ---
  { position: [-6.0, -0.5, 0.5],  scale: [5.0, 0.25, 5.0] },
  { position: [-6.5, -0.5, -2.5], scale: [5.5, 0.3, 7.0], rotation: 0.06 },
  { position: [-7.0, -0.5, -5.5], scale: [5.0, 0.35, 6.0], rotation: 0.08 },
  { position: [-6.0, -0.5, -7.5], scale: [4.5, 0.25, 5.0] },
  // --- Right bank (far out, very low/wide) ---
  { position: [6.0, -0.5, 0.5],   scale: [5.0, 0.25, 5.0] },
  { position: [6.5, -0.5, -2.5],  scale: [5.5, 0.3, 7.0], rotation: -0.06 },
  { position: [7.0, -0.5, -5.5],  scale: [5.0, 0.35, 6.0], rotation: -0.08 },
  { position: [6.0, -0.5, -7.5],  scale: [4.5, 0.25, 5.0] },
  // --- Back bank (gentle close-off) ---
  { position: [0, -0.5, -8.5],    scale: [10, 0.3, 4.0] },
  { position: [-4.0, -0.5, -9.5], scale: [5, 0.25, 3.5] },
  { position: [4.0, -0.5, -9.5],  scale: [5, 0.25, 3.5] },
]

const DECO_MUSHROOMS: { position: [number, number, number]; scale: number }[] = [
  // --- Center/path level (y=-0.5 is ground, mushroom base offset is -0.15) ---
  { position: [-2.5, -0.38, -2.5], scale: 1.0 },
  { position: [2.5, -0.38, -1.2],  scale: 0.5 },
  { position: [-2.0, -0.38, -0.5], scale: 0.6 },
  { position: [1.8, -0.38, -3.0],  scale: 0.45 },
  // --- Left bank mushrooms (on the mounds, pushed far out) ---
  { position: [-5.0, -0.3, -0.8],   scale: 0.9 },
  { position: [-5.8, -0.25, -1.8],  scale: 0.7 },
  { position: [-6.2, -0.2, -3.0],   scale: 1.1 },
  { position: [-5.5, -0.25, -4.2],  scale: 0.6 },
  { position: [-6.8, -0.2, -3.8],   scale: 0.8 },
  { position: [-5.2, -0.3, -5.5],   scale: 0.5 },
  { position: [-4.5, -0.35, 0.3],   scale: 0.65 },
  // --- Right bank mushrooms (on the mounds, pushed far out) ---
  { position: [5.2, -0.3, -0.5],    scale: 0.85 },
  { position: [5.8, -0.25, -1.5],   scale: 0.7 },
  { position: [6.5, -0.2, -3.2],    scale: 1.0 },
  { position: [5.2, -0.25, -3.8],   scale: 0.55 },
  { position: [6.2, -0.2, -4.5],    scale: 0.75 },
  { position: [5.8, -0.25, -2.2],   scale: 0.9 },
  { position: [4.5, -0.35, 0.2],    scale: 0.6 },
  // --- Back mushrooms ---
  { position: [-2.5, -0.35, -6.5],  scale: 0.4 },
  { position: [2.5, -0.35, -6.8],   scale: 0.35 },
  { position: [0, -0.35, -7.2],     scale: 0.5 },
]

const GLOW_PLANTS: { position: [number, number, number]; scale: number }[] = [
  // --- Path level (ground y=-0.5) ---
  { position: [-2.0, -0.5, -1],   scale: 1.0 },
  { position: [2.0, -0.5, -1.8],  scale: 1.0 },
  { position: [-1.0, -0.5, -2.2], scale: 1.0 },
  { position: [2.8, -0.5, -0.8],  scale: 1.0 },
  { position: [0.8, -0.5, -0.5],  scale: 0.6 },
  { position: [0.2, -0.5, -3.0],  scale: 0.7 },
  // --- Left bank (on mounds, far out) ---
  { position: [-5.5, -0.35, -2.0],  scale: 1.3 },
  { position: [-4.5, -0.4, 0.2],    scale: 0.8 },
  { position: [-6.0, -0.3, -1.0],   scale: 0.9 },
  { position: [-6.5, -0.25, -3.5],  scale: 1.0 },
  { position: [-5.8, -0.3, -5.0],   scale: 0.6 },
  { position: [-7.0, -0.25, -2.8],  scale: 0.7 },
  // --- Right bank (on mounds, far out) ---
  { position: [5.8, -0.3, -2.5],  scale: 1.1 },
  { position: [4.5, -0.4, -0.3],  scale: 0.8 },
  { position: [6.2, -0.25, -1.8], scale: 0.9 },
  { position: [6.0, -0.3, -4.2],  scale: 0.7 },
  { position: [7.0, -0.25, -3.5], scale: 0.6 },
  // --- Back / distance ---
  { position: [-1.5, -0.45, -3.8], scale: 0.4 },
  { position: [2.5, -0.45, -3.5],  scale: 0.35 },
  { position: [-1.0, -0.45, -4.5], scale: 0.3 },
  { position: [1.5, -0.45, -4.5],  scale: 0.25 },
  { position: [0.5, -0.45, -5.2],  scale: 0.2 },
  { position: [-5.5, -0.3, -6.0],  scale: 0.3 },
  { position: [6.0, -0.3, -5.5],   scale: 0.25 },
  { position: [-0.5, -0.45, -6.5], scale: 0.2 },
  { position: [-3.0, -0.4, -7.5],  scale: 0.15 },
  { position: [3.5, -0.4, -7.5],   scale: 0.15 },
]

const TREES: { position: [number, number, number]; scale: number; seed: number }[] = [
  // --- Front framing trees (close to camera, screen edges) ---
  { position: [-5.5, -0.5, 1.0],  scale: 2.0, seed: 8 },
  { position: [5.5, -0.5, 0.8],   scale: 1.9, seed: 9 },
  { position: [-7.0, -0.5, -0.5], scale: 2.2, seed: 10 },
  { position: [7.0, -0.5, -0.3],  scale: 2.1, seed: 11 },

  // --- Mid-ground tall trees ---
  { position: [-4.5, -0.5, -3.0], scale: 1.5, seed: 0 },
  { position: [5.0, -0.5, -3.5],  scale: 1.4, seed: 1 },
  { position: [-6.0, -0.5, -4.5], scale: 1.3, seed: 4 },
  { position: [6.5, -0.5, -5.0],  scale: 1.1, seed: 7 },
  { position: [-3.0, -0.5, -2.0], scale: 1.6, seed: 12 },
  { position: [3.8, -0.5, -2.2],  scale: 1.5, seed: 13 },

  // --- Mid-ground medium trees ---
  { position: [-2.5, -0.5, -5.0], scale: 0.9, seed: 2 },
  { position: [3.5, -0.5, -5.5],  scale: 0.8, seed: 3 },
  { position: [1.5, -0.5, -6.5],  scale: 0.7, seed: 5 },
  { position: [-5.5, -0.5, -6.0], scale: 1.0, seed: 14 },
  { position: [5.5, -0.5, -6.5],  scale: 0.85, seed: 15 },

  // --- Background trees (far, smaller from perspective) ---
  { position: [-4.0, -0.5, -7.0], scale: 0.6, seed: 6 },
  { position: [2.5, -0.5, -8.0],  scale: 0.55, seed: 16 },
  { position: [-1.5, -0.5, -8.5], scale: 0.5, seed: 17 },
  { position: [4.5, -0.5, -9.0],  scale: 0.45, seed: 18 },
  { position: [-3.5, -0.5, -9.5], scale: 0.4, seed: 19 },
  { position: [0.5, -0.5, -10.0], scale: 0.35, seed: 20 },

  // --- Extra side fill ---
  { position: [-7.5, -0.5, -3.0], scale: 1.7, seed: 21 },
  { position: [8.0, -0.5, -3.5],  scale: 1.6, seed: 22 },
  { position: [-8.5, -0.5, -6.0], scale: 1.0, seed: 23 },
  { position: [8.5, -0.5, -7.0],  scale: 0.9, seed: 24 },
]

type CloudConfig = {
  position: [number, number, number]
  speed: number
  opacity: { normal: number; dark: number }
  segments: number
  bounds: [number, number, number]
  volume: number
  color: { normal: string; dark: string }
  seed?: number
}

const SKY_CLOUDS: CloudConfig[] = [
  { position: [0, 5, -6],    speed: 0.15, opacity: { normal: 0.35, dark: 0.35 }, segments: 8,  bounds: [10, 2, 3],   volume: 5,   color: { normal: Color.CLOUD_SKY_BRIGHT, dark: Color.CLOUD_SKY_DARK } },
  { position: [-5, 4, -5],   speed: 0.1,  opacity: { normal: 0.3,  dark: 0.3 },  segments: 6,  bounds: [8, 1.5, 2],  volume: 4,   color: { normal: Color.CLOUD_SKY_MID,    dark: Color.CLOUD_SKY_DARK_B }, seed: 42 },
  { position: [4, 4.5, -7],  speed: 0.12, opacity: { normal: 0.28, dark: 0.3 },  segments: 6,  bounds: [8, 1.5, 2],  volume: 4,   color: { normal: Color.CLOUD_SKY_BRIGHT, dark: Color.CLOUD_SKY_DARK }, seed: 99 },
  { position: [-2, 6, -8],   speed: 0.08, opacity: { normal: 0.25, dark: 0.25 }, segments: 8,  bounds: [12, 2, 3],   volume: 5,   color: { normal: Color.CLOUD_SKY_DIM,    dark: Color.CLOUD_SKY_DARK_C }, seed: 15 },
  { position: [6, 5.5, -9],  speed: 0.1,  opacity: { normal: 0.22, dark: 0.25 }, segments: 5,  bounds: [8, 1.5, 2],  volume: 3.5, color: { normal: Color.CLOUD_SKY_MID,    dark: Color.CLOUD_SKY_DARK }, seed: 33 },
  { position: [-7, 5, -8],   speed: 0.07, opacity: { normal: 0.2,  dark: 0.2 },  segments: 5,  bounds: [6, 1, 2],    volume: 3,   color: { normal: Color.CLOUD_SKY_DIM,    dark: Color.CLOUD_SKY_DARK_C }, seed: 77 },
  { position: [2, 6.5, -10], speed: 0.06, opacity: { normal: 0.18, dark: 0.2 },  segments: 5,  bounds: [10, 1.5, 3], volume: 4,   color: { normal: Color.CLOUD_SKY_MID,    dark: Color.CLOUD_SKY_DARK_B }, seed: 55 },
]

const FOG_CLOUDS: CloudConfig[] = [
  // Main ground mist — wide and visible
  { position: [0, -0.1, -1],  speed: 0.05, opacity: { normal: 0.3,  dark: 0.4 },  segments: 12, bounds: [16, 1.0, 12], volume: 3,   color: { normal: Color.CLOUD_FOG_NORMAL,   dark: Color.CLOUD_FOG_DARK }, seed: 7 },
  { position: [-3, 0.1, -3],  speed: 0.03, opacity: { normal: 0.25, dark: 0.35 }, segments: 10, bounds: [10, 0.8, 8],  volume: 2.5, color: { normal: Color.CLOUD_FOG_NORMAL_B, dark: Color.CLOUD_FOG_DARK_B }, seed: 23 },
  { position: [3, 0, -2],     speed: 0.04, opacity: { normal: 0.22, dark: 0.3 },  segments: 8,  bounds: [8, 0.7, 6],   volume: 2.5, color: { normal: Color.CLOUD_FOG_NORMAL,   dark: Color.CLOUD_FOG_DARK }, seed: 51 },
  // Extra mid-ground haze for depth
  { position: [0, 0.2, -5],   speed: 0.02, opacity: { normal: 0.2,  dark: 0.3 },  segments: 10, bounds: [14, 0.6, 8],  volume: 2.5, color: { normal: Color.CLOUD_FOG_NORMAL_B, dark: Color.CLOUD_FOG_DARK_B }, seed: 63 },
  // Close foreground wisps
  { position: [-1, 0.3, 1],   speed: 0.06, opacity: { normal: 0.15, dark: 0.25 }, segments: 6,  bounds: [8, 0.5, 4],   volume: 2,   color: { normal: Color.CLOUD_FOG_NORMAL,   dark: Color.CLOUD_FOG_DARK }, seed: 88 },
]

const ALL_CLOUDS = [...SKY_CLOUDS, ...FOG_CLOUDS]

const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragmentShader = `
  uniform vec3 uTopColor;
  uniform vec3 uMidColor;
  uniform vec3 uBotColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y;
    vec3 color;
    if (h > 0.0) {
      color = mix(uMidColor, uTopColor, h);
    } else {
      color = mix(uMidColor, uBotColor, -h);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`

function DecoMushroom({ position, scale, evolution }: {
  position: [number, number, number]; scale: number; evolution: EvolutionState
}) {
  const stemRef = useRef<THREE.MeshStandardMaterial>(null)
  const capRef = useRef<THREE.MeshStandardMaterial>(null)
  const mode = evolution === 'dark' ? 'dark' : 'normal'

  useFrame(() => {
    stemRef.current?.color.lerp(Env.decoColors[mode].stem, LERP)
    if (capRef.current) {
      capRef.current.color.lerp(Env.decoColors[mode].cap, LERP)
      capRef.current.emissive.lerp(Env.decoEmissive[mode], LERP)
    }
  })

  return (
    <group position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
        <meshStandardMaterial ref={stemRef} color={Env.decoColors.normal.stem} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <sphereGeometry args={[0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial ref={capRef} color={Env.decoColors.normal.cap} emissive={Env.decoEmissive.normal} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function GlowPlant({ position, scale = 1, evolution }: {
  position: [number, number, number]; scale?: number; evolution: EvolutionState
}) {
  const hasLight = scale >= Env.glowLightThreshold
  const lightRef = useRef<THREE.PointLight>(null)
  const stemRef = useRef<THREE.MeshStandardMaterial>(null)
  const bulbRef = useRef<THREE.MeshStandardMaterial>(null)
  const target = evolution === 'dark' ? Env.plantColors.dark : Env.plantColors.normal

  useFrame((state) => {
    stemRef.current?.color.lerp(target.stem, LERP)
    if (bulbRef.current) {
      bulbRef.current.color.lerp(target.bulb, LERP)
      bulbRef.current.emissive.lerp(target.bulb, LERP)
    }
    if (lightRef.current) {
      lightRef.current.color.lerp(target.bulb, LERP)
      lightRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.25
    }
  })

  return (
    <group position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.03, 0.5, 6]} />
        <meshStandardMaterial ref={stemRef} color={Env.plantColors.normal.stem} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial ref={bulbRef} color={Env.plantColors.normal.bulb} emissive={Env.plantColors.normal.bulb} emissiveIntensity={hasLight ? 0.8 : 1.0} />
      </mesh>
      {hasLight && <pointLight ref={lightRef} position={[0, 0.3, 0]} color={Env.plantColors.normal.bulb} intensity={0.5} distance={3} />}
    </group>
  )
}

function GroundMound({ position, scale, rotation = 0, evolution, texture }: {
  position: [number, number, number]; scale: [number, number, number]; rotation?: number; evolution: EvolutionState; texture: THREE.CanvasTexture
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const mode = evolution === 'dark' ? 'dark' : 'normal'

  useFrame(() => {
    matRef.current?.color.lerp(Env.bankColors[mode], LERP)
  })

  return (
    <mesh position={position} scale={scale} rotation={[0, rotation, 0]}>
      <sphereGeometry args={[1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial ref={matRef} color={Env.bankColors.normal} map={texture} roughness={0.95} />
    </mesh>
  )
}

function Tree({ position, scale, seed, evolution }: {
  position: [number, number, number]; scale: number; seed: number; evolution: EvolutionState
}) {
  const trunkRef = useRef<THREE.MeshStandardMaterial>(null)
  const canopyRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const mode = evolution === 'dark' ? 'dark' : 'normal'
  const targetColor = Env.treeColors[mode]
  const targetEmissive = Env.treeEmissive[mode]

  // Seed-based variation — tall trunks for magical ancient forest feel
  const heightTier = [2.5, 3.2, 4.0, 3.6, 2.8, 3.4, 2.2, 4.5, 3.0, 3.8, 2.6, 4.2, 3.5, 2.4, 3.1, 4.0, 2.9, 3.7, 2.3, 3.3, 4.3, 2.7, 3.9, 2.5, 3.6]
  const trunkHeight = heightTier[seed % heightTier.length]
  const spread = 0.8 + (seed % 4) * 0.15
  const lean = ((seed % 7) - 3) * 0.03
  const canopyY = trunkHeight * 0.82

  // Overlapping spheres for rounded oak/elm canopy
  const canopyBlobs = useMemo(() => [
    { pos: [0, canopyY, 0] as const, scl: [spread * 1.4, spread * 0.8, spread * 1.3] as const },
    { pos: [spread * 0.35, canopyY + spread * 0.2, spread * 0.15] as const, scl: [spread * 0.95, spread * 0.6, spread * 0.85] as const },
    { pos: [-spread * 0.3, canopyY + spread * 0.35, -spread * 0.12] as const, scl: [spread * 0.85, spread * 0.55, spread * 0.75] as const },
  ], [canopyY, spread])

  useFrame(() => {
    if (trunkRef.current) {
      trunkRef.current.color.lerp(targetColor.trunk, LERP)
      trunkRef.current.emissive.lerp(targetEmissive.trunk, LERP)
      trunkRef.current.emissiveIntensity += (Env.trunkEmissiveIntensity[mode] - trunkRef.current.emissiveIntensity) * LERP
    }
    for (const mat of canopyRefs.current) {
      if (mat) {
        mat.color.lerp(targetColor.canopy, LERP)
        mat.emissive.lerp(targetEmissive.canopy, LERP)
        mat.emissiveIntensity += (Env.canopyEmissiveIntensity[mode] - mat.emissiveIntensity) * LERP
      }
    }
  })

  return (
    <group position={position} scale={scale} rotation={[0, 0, lean]}>
      {/* Trunk — massive tapered cylinder, old-growth feel */}
      <mesh position={[0, trunkHeight / 2, 0]}>
        <cylinderGeometry args={[0.14, 0.35, trunkHeight, 8]} />
        <meshStandardMaterial ref={trunkRef} color={Env.treeColors.normal.trunk} emissive={Env.treeEmissive.normal.trunk} emissiveIntensity={Env.trunkEmissiveIntensity.normal} />
      </mesh>
      {/* Canopy — overlapping spheres for spreading oak/elm shape */}
      {canopyBlobs.map((blob, i) => (
        <mesh key={i} position={blob.pos} scale={blob.scl}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            ref={el => { canopyRefs.current[i] = el }}
            color={Env.treeColors.normal.canopy}
            emissive={Env.treeEmissive.normal.canopy}
            emissiveIntensity={Env.canopyEmissiveIntensity.normal}
          />
        </mesh>
      ))}
    </group>
  )
}

function Moon({ evolution }: { evolution: EvolutionState }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const mode = evolution === 'dark' ? 'dark' : 'normal'

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity += (Env.moonOpacity[mode] - matRef.current.opacity) * LERP
    }
    if (lightRef.current) {
      lightRef.current.intensity += (Env.moonLightIntensity[mode] - lightRef.current.intensity) * LERP
    }
  })

  return (
    <group position={Env.moonPosition}>
      <mesh renderOrder={999}>
        <sphereGeometry args={[Env.moonRadius, 16, 16]} />
        <meshBasicMaterial
          ref={matRef}
          color={Env.moonColor}
          transparent
          opacity={0.9}
          depthTest={false}
          fog={false}
        />
      </mesh>
      <pointLight ref={lightRef} color={Env.moonLightColor} intensity={0.6} distance={30} />
    </group>
  )
}

function createMossTexture(size: number, tileCount: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base fill
  ctx.fillStyle = '#506850'
  ctx.fillRect(0, 0, size, size)

  // Fast pixel-level noise via imageData (no arc draws)
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40
    data[i] = Math.max(0, Math.min(255, data[i] + noise * 0.6))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.7))
  }
  ctx.putImageData(imageData, 0, 0)

  // A few moss patches for variation
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 12 + 3
    const bright = Math.random()
    ctx.fillStyle = `rgba(${20 + Math.floor(bright * 40)}, ${60 + Math.floor(bright * 50)}, ${30 + Math.floor(bright * 35)}, ${0.1 + Math.random() * 0.12})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(tileCount, tileCount)
  return texture
}

export default function Forest() {
  const fogRef = useRef<THREE.FogExp2>(null)
  const groundRef = useRef<THREE.MeshStandardMaterial>(null)
  const evolution = useMushroomStore((s) => s.evolution)

  const groundTexture = useMemo(() => createMossTexture(256, 4), [])
  const bankTexture = useMemo(() => createMossTexture(128, 3), [])

  const skyUniforms = useMemo(() => ({
    uTopColor: { value: Env.skyColors.normal.top.clone() },
    uMidColor: { value: Env.skyColors.normal.mid.clone() },
    uBotColor: { value: Env.skyColors.normal.bot.clone() },
  }), [])

  const skyMaterial = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
    }),
    [skyUniforms],
  )

  useFrame(() => {
    const mode = evolution === 'dark' ? 'dark' : 'normal'

    if (fogRef.current) fogRef.current.density += (Env.fogDensity[mode] - fogRef.current.density) * LERP
    groundRef.current?.color.lerp(Env.groundColors[mode], LERP)

    skyUniforms.uTopColor.value.lerp(Env.skyColors[mode].top, LERP)
    skyUniforms.uMidColor.value.lerp(Env.skyColors[mode].mid, LERP)
    skyUniforms.uBotColor.value.lerp(Env.skyColors[mode].bot, LERP)
  })

  const isDark = evolution === 'dark'
  const mode = isDark ? 'dark' : 'normal'

  return (
    <group>
      <fogExp2 ref={fogRef} attach="fog" args={[Env.fogColor, Env.fogDensity.normal]} />

      <mesh material={skyMaterial}>
        <sphereGeometry args={[Env.skyRadius, 32, 16]} />
      </mesh>

      <Moon evolution={evolution} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[Env.groundRadius, 32]} />
        <meshStandardMaterial ref={groundRef} color={Env.groundColors.normal} map={groundTexture} roughness={0.95} />
      </mesh>

      <Clouds texture="/cloud.png">
        {ALL_CLOUDS.map((c, i) => (
          <Cloud
            key={i}
            position={c.position}
            speed={c.speed}
            opacity={c.opacity[mode]}
            segments={c.segments}
            bounds={c.bounds}
            volume={c.volume}
            color={c.color[mode]}
            seed={c.seed}
          />
        ))}
      </Clouds>

      <Sparkles count={Env.sparkles.count} size={Env.sparkles.size} scale={Env.sparkles.scale} position={[0, -0.1, 0]} speed={Env.sparkles.speed} color={Env.smokeColor[mode]} opacity={Env.smokeOpacity[mode]} noise={Env.sparkles.noise} />

      {GROUND_MOUNDS.map((props, i) => (
        <GroundMound key={i} {...props} evolution={evolution} texture={bankTexture} />
      ))}
      {DECO_MUSHROOMS.map((props, i) => (
        <DecoMushroom key={i} {...props} evolution={evolution} />
      ))}
      {GLOW_PLANTS.map((props, i) => (
        <GlowPlant key={i} {...props} evolution={evolution} />
      ))}
      {TREES.map((props, i) => (
        <Tree key={i} {...props} evolution={evolution} />
      ))}
    </group>
  )
}
