import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

interface PostEffectsProps {
  bloomIntensity?: number
  bloomThreshold?: number
  vignetteStrength?: number
  isDark?: boolean
}

export default function PostEffects({
  bloomIntensity = 0.4,
  bloomThreshold = 0.8,
  vignetteStrength = 0.3,
  isDark = false,
}: PostEffectsProps) {
  return (
    <EffectComposer>
      {/* Soft bloom for glowing elements */}
      <Bloom
        intensity={isDark ? bloomIntensity * 1.5 : bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Vignette for atmospheric depth */}
      <Vignette
        offset={0.5}
        darkness={isDark ? vignetteStrength * 1.1 : vignetteStrength}
        eskil={false}
      />

      {/* Tone mapping for color correction */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
