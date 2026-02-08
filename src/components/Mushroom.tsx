import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMushroomStore } from '../stores/mushroomStore'
import { useFireflyStore } from '../stores/fireflyStore'
import { mushroomWorldPos } from '../stores/mushroomPosition'
import { LERP, BEHAVIOR, POKE } from '../constants'
import { pickRandom } from '../utils/helpers'
import { POKE_MESSAGES } from '../ai/messages'
import { Mushroom as M } from '../config'

const COLOR_KEYS = Object.keys(M.colors.normal) as (keyof typeof M.colors.normal)[]
const _projVec = new THREE.Vector3()

function buildSpots(count: number, coverage: number) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const up = new THREE.Vector3(0, 1, 0)
  return Array.from({ length: count }, (_, i) => {
    const theta = Math.acos(1 - (i + 0.5) / count * coverage)
    const phi = (i * golden) % (Math.PI * 2)
    const normal = new THREE.Vector3(Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi))
    const pos = normal.clone().multiplyScalar(M.capRadius)
    const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, normal))
    return { position: [pos.x, pos.y, pos.z] as [number, number, number], rotation: [euler.x, euler.y, euler.z] as [number, number, number], size: M.spotSizes[i % M.spotSizes.length] }
  })
}

const SPOTS = buildSpots(M.spotCount, M.spotCoverage)

// Rounded stem profile — lathe geometry with soft bottom edge
const STEM_PROFILE = (() => {
  const [topR, botR, h] = [M.stemArgs[0], M.stemArgs[1], M.stemArgs[2]]
  const halfH = h / 2
  const roundR = 0.08
  const pts: THREE.Vector2[] = []
  pts.push(new THREE.Vector2(0, halfH))
  pts.push(new THREE.Vector2(topR, halfH))
  pts.push(new THREE.Vector2(botR, -halfH + roundR))
  const steps = 6
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * (Math.PI / 2)
    pts.push(new THREE.Vector2(
      (botR - roundR) + Math.cos(angle) * roundR,
      (-halfH + roundR) - Math.sin(angle) * roundR,
    ))
  }
  pts.push(new THREE.Vector2(0, -halfH))
  return pts
})()

export default function Mushroom() {
  const groupRef = useRef<THREE.Group>(null)
  const mouthRef = useRef<THREE.Mesh>(null)
  const capMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const stemMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const spotsMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const eyeLeftMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const eyeRightMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const eyeLeftMeshRef = useRef<THREE.Mesh>(null)
  const eyeRightMeshRef = useRef<THREE.Mesh>(null)
  const pupilLeftGroupRef = useRef<THREE.Group>(null)
  const pupilRightGroupRef = useRef<THREE.Group>(null)
  const pupilLeftMeshRef = useRef<THREE.Mesh>(null)
  const pupilRightMeshRef = useRef<THREE.Mesh>(null)
  const pupilLeftMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const pupilRightMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const cheekLeftMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const cheekRightMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const highlightLeftMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const highlightRightMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const browLeftRef = useRef<THREE.Mesh>(null)
  const browRightRef = useRef<THREE.Mesh>(null)
  const browLeftMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const browRightMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const capGroupRef = useRef<THREE.Group>(null)
  const currentColors = useRef(
    Object.fromEntries(COLOR_KEYS.map((k) => [k, M.colors.normal[k].clone()])) as Record<keyof typeof M.colors.normal, THREE.Color>,
  )

  const feedBounce = useRef(0)
  const mouthOpen = useRef(0)
  const lastFeedRef = useRef(0)

  const mistShimmy = useRef(0)
  const lastMistRef = useRef(0)

  const pokeJolt = useRef(0)
  const lastPokeRef = useRef(0)
  const pokeTimestamps = useRef<number[]>([])

  const giftGlow = useRef(0)
  const lastGiftRef = useRef(0)

  // Hop animation state machine
  const hopPhase = useRef<'idle' | 'hopping'>('idle')
  const phaseTime = useRef(0)
  const hopX = useRef(0)
  const hopStartX = useRef(0)
  const hopTargetX = useRef(0)
  const hopDir = useRef(1)
  const hopFacing = useRef(0)
  const hopFacingTarget = useRef(0)
  const nextIdleDuration = useRef(2.0)

  const handlePoke = useCallback(() => {
    // If scooping with fireflies, deliver gift instead of poking
    const fireflyState = useFireflyStore.getState()
    if (fireflyState.phase === 'scooping' && fireflyState.jarCount > 0) {
      const count = fireflyState.deliverGift()
      useMushroomStore.getState().giveFireflies(count)
      return
    }

    const now = Date.now()
    const store = useMushroomStore.getState()

    if (now - lastPokeRef.current < POKE.cooldownMs) return
    store.poke()

    const cutoff = now - POKE.annoyanceWindow
    pokeTimestamps.current = pokeTimestamps.current.filter((t) => t > cutoff)
    pokeTimestamps.current.push(now)

    const annoyed = pokeTimestamps.current.length >= POKE.annoyanceThreshold
    const msg = annoyed ? pickRandom(POKE_MESSAGES.annoyed) : pickRandom(POKE_MESSAGES.normal)
    store.receiveMessage(msg)
  }, [])

  useFrame(({ clock, camera, size }, delta) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const { evolution, hunger, lastFeedTime, lastMistTime, lastPokeTime, lastGiftTime } = useMushroomStore.getState()
    const isDark = evolution === 'dark'
    const mode = isDark ? 'dark' : 'normal'

    // Feed detection
    if (lastFeedTime > 0 && lastFeedTime !== lastFeedRef.current) {
      lastFeedRef.current = lastFeedTime
      feedBounce.current = 1
      mouthOpen.current = 1.2
      useMushroomStore.getState().reactToEvent('fed')
    }
    if (mouthOpen.current > 0) mouthOpen.current -= delta * 0.8

    // Mist detection
    if (lastMistTime > 0 && lastMistTime !== lastMistRef.current) {
      lastMistRef.current = lastMistTime
      mistShimmy.current = 1
      useMushroomStore.getState().reactToEvent('misted')
    }

    // Poke detection
    if (lastPokeTime > 0 && lastPokeTime !== lastPokeRef.current) {
      lastPokeRef.current = lastPokeTime
      pokeJolt.current = 1
    }

    // Gift detection
    if (lastGiftTime > 0 && lastGiftTime !== lastGiftRef.current) {
      lastGiftRef.current = lastGiftTime
      giftGlow.current = 1
      feedBounce.current = 0.8
      useMushroomStore.getState().reactToEvent('gifted')
    }

    // Decay animations
    const anim = hunger >= BEHAVIOR.hungerThreshold ? M.anim.hungry : M.anim.happy
    const hop = anim.hop
    feedBounce.current *= M.decay.feedBounce
    mistShimmy.current *= M.decay.mistShimmy
    pokeJolt.current *= M.decay.pokeJolt
    giftGlow.current *= M.decay.giftGlow

    // Hop state machine
    phaseTime.current += delta
    let hopArcY = 0
    let currentX = hopX.current
    let tiltZ = 0
    let landFactor = 0

    if (hopPhase.current === 'idle') {
      // Gentle bounce in place
      hopArcY = Math.sin(t * hop.idleBounceSpeed) * hop.idleBounceAmt
      tiltZ = Math.sin(t * hop.swaySpeed) * hop.swayAmt

      // Transition to hopping
      if (phaseTime.current >= nextIdleDuration.current) {
        hopPhase.current = 'hopping'
        phaseTime.current = 0
        hopStartX.current = hopX.current

        // Pick direction — must reverse at boundary, otherwise 25% chance to flip
        const wouldExceed = Math.abs(hopX.current + hopDir.current * hop.stepSize) > hop.range
        if (wouldExceed) {
          hopDir.current *= -1
        } else if (Math.random() < 0.25) {
          hopDir.current *= -1
        }

        // Vary step size slightly for natural feel
        const stepVariation = hop.stepSize * (0.7 + Math.random() * 0.6)
        hopTargetX.current = Math.max(-hop.range, Math.min(hop.range,
          hopX.current + hopDir.current * stepVariation
        ))

        // Set facing target toward movement direction
        hopFacingTarget.current = hopDir.current * 0.35
      }
    }

    if (hopPhase.current === 'hopping') {
      const frac = Math.min(phaseTime.current / hop.hopDuration, 1)

      // Parabolic arc
      hopArcY = Math.sin(frac * Math.PI) * hop.height

      // Smoothstep lateral interpolation
      const ss = frac * frac * (3 - 2 * frac)
      currentX = hopStartX.current + (hopTargetX.current - hopStartX.current) * ss

      // Body tilt into movement direction
      tiltZ = hopDir.current * hop.tiltAmt * Math.sin(frac * Math.PI)

      // Landing squash near ground
      landFactor = Math.pow(1 - Math.sin(frac * Math.PI), 4) * hop.landSquash

      // Hop finished
      if (frac >= 1) {
        hopX.current = hopTargetX.current
        currentX = hopTargetX.current
        hopPhase.current = 'idle'
        phaseTime.current = 0
        // Randomize next idle duration for natural rhythm
        nextIdleDuration.current = hop.idleDuration * (0.6 + Math.random() * 0.8)
      }
    }

    // Smooth facing: lerp toward target direction each frame
    hopFacing.current += (hopFacingTarget.current - hopFacing.current) * 0.06

    // Position: hop + interaction overlays, clamped so bottom never clips ground (y=-0.5)
    const minY = -0.5 + M.stemArgs[2] / 2 + 0.1 // ground + half stem height + padding for rounded bottom
    const rawY = anim.baseY + hopArcY + feedBounce.current * Math.sin(t * 8) * 0.15 + mistShimmy.current * Math.sin(t * 18) * 0.04
    groupRef.current.position.y = Math.max(rawY, minY)
    groupRef.current.position.x = currentX + pokeJolt.current * Math.sin(t * 20) * 0.05 + mistShimmy.current * Math.sin(t * 22) * 0.03

    // Write world + screen position for interaction targets
    mushroomWorldPos.x = currentX
    mushroomWorldPos.y = anim.baseY + hopArcY
    _projVec.set(currentX, anim.baseY + hopArcY + 0.3, 0.3)
    _projVec.project(camera)
    mushroomWorldPos.screenX = ((_projVec.x + 1) / 2) * size.width
    mushroomWorldPos.screenY = ((1 - _projVec.y) / 2) * size.height

    // Rotation: tilt + mist shimmy + turn-away
    groupRef.current.rotation.z = tiltZ + mistShimmy.current * Math.sin(t * 15) * 0.2
    groupRef.current.rotation.y = hopFacing.current

    // Squash/stretch: landing squash + poke squish
    const squash = 1 + landFactor
    const pokeSquish = 1 - pokeJolt.current * 0.08
    groupRef.current.scale.set(1 / squash / pokeSquish, squash * pokeSquish, 1 / squash / pokeSquish)

    // Color transitions
    const targetColors = M.colors[mode]
    const targetEmissive = M.emissive[mode]
    for (const key of COLOR_KEYS) currentColors.current[key].lerp(targetColors[key], LERP)

    if (capMatRef.current) {
      capMatRef.current.color.copy(currentColors.current.cap)
      capMatRef.current.emissiveIntensity = giftGlow.current * 0.5
    }
    stemMatRef.current?.color.copy(currentColors.current.stem)
    if (spotsMatRef.current) {
      spotsMatRef.current.color.copy(currentColors.current.spots)
      spotsMatRef.current.emissive.lerp(targetEmissive.spots, LERP)
    }
    for (const ref of [eyeLeftMatRef, eyeRightMatRef]) {
      if (!ref.current) continue
      ref.current.color.copy(currentColors.current.eyes)
      ref.current.emissive.lerp(targetEmissive.eyes, LERP)
    }

    // Eye scale: round in normal, narrow slits in dark
    const targetEyeScaleY = isDark ? 0.35 : 1
    const targetEyeScaleX = isDark ? 1.3 : 1
    for (const ref of [eyeLeftMeshRef, eyeRightMeshRef]) {
      if (!ref.current) continue
      ref.current.scale.y += (targetEyeScaleY - ref.current.scale.y) * LERP
      ref.current.scale.x += (targetEyeScaleX - ref.current.scale.x) * LERP
    }

    // Pupil gaze — sharpened waves that snap through center, dwell at edges
    const gazeSpeed = isDark ? 1.5 : 1
    const gazeAmtX = isDark ? 0.024 : 0.018
    const gazeAmtY = isDark ? 0.016 : 0.012
    // sharpness < 1 = more time at extremes, quick snap through center
    const sx = Math.sin(t * 0.7 * gazeSpeed)
    const sy = Math.sin(t * 0.5 * gazeSpeed + 1.0)
    const sx2 = Math.sin(t * 1.3 * gazeSpeed + 2.0)
    const sy2 = Math.cos(t * 0.9 * gazeSpeed + 3.0)
    const sharp = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p)
    const gazeX = sharp(sx, 0.4) * gazeAmtX + sharp(sx2, 0.4) * gazeAmtX * 0.4
    const gazeY = sharp(sy, 0.4) * gazeAmtY + sharp(sy2, 0.4) * gazeAmtY * 0.5
    for (const [ref, baseX] of [[pupilLeftGroupRef, -M.eyeOffsetX], [pupilRightGroupRef, M.eyeOffsetX]] as const) {
      if (!ref.current) continue
      ref.current.position.x = baseX + gazeX
      ref.current.position.y = M.eyeY + gazeY
    }

    // Pupil color + emissive
    for (const ref of [pupilLeftMatRef, pupilRightMatRef]) {
      if (!ref.current) continue
      ref.current.color.copy(currentColors.current.pupils)
      ref.current.emissive.lerp(targetEmissive.pupils, LERP)
    }

    // Pupil scale: match sclera slit in dark mode
    for (const ref of [pupilLeftMeshRef, pupilRightMeshRef]) {
      if (!ref.current) continue
      ref.current.scale.y += (targetEyeScaleY - ref.current.scale.y) * LERP
      ref.current.scale.x += (targetEyeScaleX - ref.current.scale.x) * LERP
    }

    // Cheek opacity: visible in normal, hidden in dark
    const targetCheekOpacity = isDark ? 0 : 0.6
    for (const ref of [cheekLeftMatRef, cheekRightMatRef]) {
      if (ref.current) ref.current.opacity += (targetCheekOpacity - ref.current.opacity) * LERP
    }

    // Highlight opacity: visible in normal, hidden in dark
    const targetHighlightOpacity = isDark ? 0 : 1
    for (const ref of [highlightLeftMatRef, highlightRightMatRef]) {
      if (ref.current) ref.current.opacity += (targetHighlightOpacity - ref.current.opacity) * LERP
    }

    // Angry brows: visible in dark, hidden in normal
    const targetBrowOpacity = isDark ? 1.0 : 0
    for (const ref of [browLeftMatRef, browRightMatRef]) {
      if (ref.current) ref.current.opacity += (targetBrowOpacity - ref.current.opacity) * LERP
    }
    // Angle brows inward (angry V shape)
    const targetBrowAngle = isDark ? 0.55 : 0
    if (browLeftRef.current) browLeftRef.current.rotation.z += (-targetBrowAngle - browLeftRef.current.rotation.z) * LERP
    if (browRightRef.current) browRightRef.current.rotation.z += (targetBrowAngle - browRightRef.current.rotation.z) * LERP

    // Cap widens when dark
    if (capGroupRef.current) {
      const targetCapX = isDark ? M.capScale[0] * 1.15 : M.capScale[0]
      const targetCapZ = isDark ? M.capScale[2] * 1.15 : M.capScale[2]
      capGroupRef.current.scale.x += (targetCapX - capGroupRef.current.scale.x) * LERP
      capGroupRef.current.scale.z += (targetCapZ - capGroupRef.current.scale.z) * LERP
    }

    // Mouth — chewing oscillation when eating
    if (mouthRef.current) {
      const eating = mouthOpen.current > 0
      const chew = eating ? 1.5 + Math.abs(Math.sin(t * 14)) * 1.5 : M.face.mouth[mode]
      mouthRef.current.scale.y += (chew - mouthRef.current.scale.y) * (eating ? 0.3 : LERP)
    }
  })

  return (
    <group ref={groupRef} onPointerDown={handlePoke}>
      {/* Stem — lathe with rounded bottom */}
      <mesh castShadow>
        <latheGeometry args={[STEM_PROFILE, 24]} />
        <meshStandardMaterial ref={stemMatRef} color={M.colors.normal.stem} />
      </mesh>

      {/* Cap — rounded beret shape, tilted back to show face */}
      <group ref={capGroupRef} position={[0, 0.3, 0]} rotation={[M.capTilt, 0, 0]} scale={M.capScale}>
        <mesh castShadow>
          <sphereGeometry args={[M.capRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial ref={capMatRef} color={M.colors.normal.cap} emissive={M.capEmissive} emissiveIntensity={0} />
        </mesh>
        {SPOTS.map((spot, i) => (
          <group key={i} position={spot.position} rotation={spot.rotation}>
            <mesh scale={[1, 0.15, 1]}>
              <sphereGeometry args={[spot.size, 12, 8]} />
              <meshStandardMaterial ref={i === 0 ? spotsMatRef : undefined} color={M.colors.normal.spots} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Eyes — base disc */}
      <mesh ref={eyeLeftMeshRef} position={[-M.eyeOffsetX, M.eyeY, M.eyeZ]} scale={[1, 1, 0.3]}>
        <sphereGeometry args={[M.eyeRadius, 16, 16]} />
        <meshStandardMaterial ref={eyeLeftMatRef} color={M.faceColor} />
      </mesh>
      <mesh ref={eyeRightMeshRef} position={[M.eyeOffsetX, M.eyeY, M.eyeZ]} scale={[1, 1, 0.3]}>
        <sphereGeometry args={[M.eyeRadius, 16, 16]} />
        <meshStandardMaterial ref={eyeRightMatRef} color={M.faceColor} />
      </mesh>

      {/* Left pupil + highlight */}
      <group ref={pupilLeftGroupRef} position={[-M.eyeOffsetX, M.eyeY, M.eyeZ + 0.01]}>
        <mesh ref={pupilLeftMeshRef} scale={[1, 1, 0.3]}>
          <sphereGeometry args={[M.pupilRadius, 16, 16]} />
          <meshStandardMaterial ref={pupilLeftMatRef} color={M.faceColor} />
        </mesh>
        <mesh position={[M.highlightOffset[0], M.highlightOffset[1], M.highlightOffset[2]]}>
          <sphereGeometry args={[M.highlightRadius, 8, 8]} />
          <meshBasicMaterial ref={highlightLeftMatRef} color="white" transparent opacity={1} />
        </mesh>
      </group>

      {/* Right pupil + highlight */}
      <group ref={pupilRightGroupRef} position={[M.eyeOffsetX, M.eyeY, M.eyeZ + 0.01]}>
        <mesh ref={pupilRightMeshRef} scale={[1, 1, 0.3]}>
          <sphereGeometry args={[M.pupilRadius, 16, 16]} />
          <meshStandardMaterial ref={pupilRightMatRef} color={M.faceColor} />
        </mesh>
        <mesh position={[M.highlightOffset[0], M.highlightOffset[1], M.highlightOffset[2]]}>
          <sphereGeometry args={[M.highlightRadius, 8, 8]} />
          <meshBasicMaterial ref={highlightRightMatRef} color="white" transparent opacity={1} />
        </mesh>
      </group>

      {/* Angry brows — appear in dark mode */}
      <mesh ref={browLeftRef} position={[-M.eyeOffsetX, M.eyeY + 0.1, M.eyeZ + 0.02]}>
        <boxGeometry args={[0.1, 0.025, 0.02]} />
        <meshBasicMaterial ref={browLeftMatRef} color={M.faceColor} transparent opacity={0} />
      </mesh>
      <mesh ref={browRightRef} position={[M.eyeOffsetX, M.eyeY + 0.1, M.eyeZ + 0.02]}>
        <boxGeometry args={[0.1, 0.025, 0.02]} />
        <meshBasicMaterial ref={browRightMatRef} color={M.faceColor} transparent opacity={0} />
      </mesh>

      {/* Rosy cheeks */}
      <mesh position={[-M.cheekOffsetX, M.cheekY, M.cheekZ]} scale={[1, 0.85, 0.6]}>
        <sphereGeometry args={[M.cheekRadius, 12, 8]} />
        <meshBasicMaterial ref={cheekLeftMatRef} color={M.cheekColor} transparent opacity={0.6} />
      </mesh>
      <mesh position={[M.cheekOffsetX, M.cheekY, M.cheekZ]} scale={[1, 0.85, 0.6]}>
        <sphereGeometry args={[M.cheekRadius, 12, 8]} />
        <meshBasicMaterial ref={cheekRightMatRef} color={M.cheekColor} transparent opacity={0.6} />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={M.mouthPos} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={M.mouthArgs} />
        <meshStandardMaterial color={M.faceColor} />
      </mesh>
    </group>
  )
}
