import { useRef, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useMushroomStore } from "../stores/mushroomStore";
import { BEHAVIOR, POKE } from "../constants";
import { POKE_MESSAGES, FIREFLY_MESSAGES } from "../ai/messages";

const ANIM = {
  happy: {
    bounceSpeed: 2,
    bounceAmt: 0.05,
    baseY: 0,
    swaySpeed: 1.5,
    swayAmt: 0.03,
  },
  hungry: {
    bounceSpeed: 1.2,
    bounceAmt: 0.02,
    baseY: -0.05,
    swaySpeed: 0.8,
    swayAmt: 0.01,
  },
} as const;

const IDLE_ANIMATIONS = ["Bounce_Right", "Bounce_Left", "Hop", "Idle_Wobble", "Restless_Hop"];

// Movement offsets for each animation
const ANIMATION_OFFSETS: Record<string, number> = {
  Bounce_Right: 0.31, // Moves right
  Bounce_Left: -0.31, // Moves left
  Hop: 0, // Stays in place
  Idle_Wobble: 0, // Stays in place
  Restless_Hop: 0, // Stays in place
};

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomIdleAnimation(): string {
  return IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
}

export default function Mushroom() {
  // Load both GLB models
  const cuteGltf = useGLTF("/Mushroom-cute.glb");
  const evilGltf = useGLTF("/Mushroom-evil.glb");

  // Separate refs for each model
  const cuteGroupRef = useRef<THREE.Group>(null);
  const evilGroupRef = useRef<THREE.Group>(null);

  // Get evolution state to determine which model to use
  const evolution = useMushroomStore((s) => s.evolution);
  const isDark = evolution === 'dark' || evolution === 'demonic';

  // Separate animation systems for each model
  const cuteAnimations = useAnimations(cuteGltf.animations, cuteGroupRef);
  const evilAnimations = useAnimations(evilGltf.animations, evilGroupRef);

  // Use the appropriate animation system and ref based on current mode
  const { actions } = isDark ? evilAnimations : cuteAnimations;
  const groupRef = isDark ? evilGroupRef : cuteGroupRef;
  const currentAnimationRef = useRef<string | null>(null);
  const lastAnimationStartTime = useRef<number>(0);
  const basePositionX = useRef<number>(0); // Track accumulated X position
  const consecutiveRightMoves = useRef<number>(0);
  const consecutiveLeftMoves = useRef<number>(0);

  const feedBounce = useRef(0);
  const talkWobble = useRef(0);
  const mouthOpen = useRef(0);
  const lastFeedRef = useRef(0);

  const mistShimmy = useRef(0);
  const lastMistRef = useRef(0);

  const pokeJolt = useRef(0);
  const lastPokeRef = useRef(0);
  const pokeTimestamps = useRef<number[]>([]);

  const giftGlow = useRef(0);
  const lastGiftRef = useRef(0);

  const handlePoke = useCallback(() => {
    const now = Date.now();
    const store = useMushroomStore.getState();

    if (now - lastPokeRef.current < POKE.cooldownMs) return;
    store.poke();

    const cutoff = now - POKE.annoyanceWindow;
    pokeTimestamps.current = pokeTimestamps.current.filter((t) => t > cutoff);
    pokeTimestamps.current.push(now);

    const annoyed = pokeTimestamps.current.length >= POKE.annoyanceThreshold;
    const msg = annoyed
      ? pickRandom(POKE_MESSAGES.annoyed)
      : pickRandom(POKE_MESSAGES.normal);
    store.receiveMessage(msg);
  }, []);

  // Reset animation system when model switches
  useEffect(() => {
    console.log("Model switched! Evolution:", evolution, "isDark:", isDark);
    console.log("Available animations:", Object.keys(actions));

    // Force animation system to restart (but preserve position)
    currentAnimationRef.current = null;
    lastAnimationStartTime.current = 0;
    consecutiveRightMoves.current = 0;
    consecutiveLeftMoves.current = 0;
    // Don't reset basePositionX - preserve the mushroom's position when switching models

    // Immediately set the new model's position to match the saved position
    if (groupRef.current) {
      groupRef.current.position.x = basePositionX.current;
    }
  }, [isDark, actions, evolution, groupRef]);

  // Initialize first animation on mount
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      console.log("Available animations:", Object.keys(actions));
      const firstAnimation = getRandomIdleAnimation();
      console.log("Playing first animation:", firstAnimation);
      if (actions[firstAnimation]) {
        actions[firstAnimation]?.reset().setLoop(THREE.LoopOnce, 1).play();
        currentAnimationRef.current = firstAnimation;
      } else {
        console.warn("Animation not found:", firstAnimation);
      }
    }
  }, [actions]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const {
      evolution,
      hunger,
      boredom,
      lastFeedTime,
      lastMistTime,
      lastPokeTime,
      lastGiftTime,
      lastGiftCount,
    } = useMushroomStore.getState();

    // Feed detection
    if (lastFeedTime > 0 && lastFeedTime !== lastFeedRef.current) {
      lastFeedRef.current = lastFeedTime;
      feedBounce.current = 1;
      mouthOpen.current = 0.4;
    }
    if (mouthOpen.current > 0) mouthOpen.current -= delta;

    // Mist detection
    if (lastMistTime > 0 && lastMistTime !== lastMistRef.current) {
      lastMistRef.current = lastMistTime;
      mistShimmy.current = 1;
    }

    // Poke detection
    if (lastPokeTime > 0 && lastPokeTime !== lastPokeRef.current) {
      lastPokeRef.current = lastPokeTime;
      pokeJolt.current = 1;
    }

    // Gift detection
    if (lastGiftTime > 0 && lastGiftTime !== lastGiftRef.current) {
      lastGiftRef.current = lastGiftTime;
      giftGlow.current = 1;
      feedBounce.current = 0.8;
      const store = useMushroomStore.getState();
      const dark = evolution === "dark";
      let msg: string;
      if (dark) {
        msg = pickRandom(FIREFLY_MESSAGES.dark);
      } else if (lastGiftCount >= 10) {
        msg = pickRandom(FIREFLY_MESSAGES.normal.lots);
      } else if (lastGiftCount >= 5) {
        msg = pickRandom(FIREFLY_MESSAGES.normal.many);
      } else {
        msg = pickRandom(FIREFLY_MESSAGES.normal.few);
      }
      store.receiveMessage(msg);
    }

    // Decay animations
    const anim = hunger >= BEHAVIOR.hungerThreshold ? ANIM.hungry : ANIM.happy;
    feedBounce.current *= 0.95;
    talkWobble.current *= 0.93;
    mistShimmy.current *= 0.94;
    pokeJolt.current *= 0.88;
    giftGlow.current *= 0.96;

    // Position: base position + procedural effects
    const verticalOffset = -0.5; // Move mushroom down
    groupRef.current.position.y =
      anim.baseY +
      verticalOffset +
      Math.sin(t * anim.bounceSpeed) * anim.bounceAmt +
      feedBounce.current * Math.sin(t * 8) * 0.15 +
      mistShimmy.current * Math.sin(t * 18) * 0.04;

    // X position: only set when animation is not running (let animation control movement)
    const isAnimating =
      currentAnimationRef.current &&
      actions[currentAnimationRef.current]?.isRunning();
    if (!isAnimating) {
      // When not animating, apply small procedural effects
      groupRef.current.position.x =
        basePositionX.current +
        pokeJolt.current * Math.sin(t * 20) * 0.05 +
        mistShimmy.current * Math.sin(t * 22) * 0.03;
    } else {
      // Animation is controlling X position - just add tiny procedural effects on top
      const animatedX = groupRef.current.position.x;
      groupRef.current.position.x =
        animatedX +
        pokeJolt.current * Math.sin(t * 20) * 0.02 +
        mistShimmy.current * Math.sin(t * 22) * 0.01;
    }

    // Rotation: sway + talk wobble + mist shimmy
    const swayAnim =
      boredom >= BEHAVIOR.boredomThreshold ? ANIM.hungry : ANIM.happy;
    groupRef.current.rotation.z =
      Math.sin(t * swayAnim.swaySpeed) * swayAnim.swayAmt +
      talkWobble.current * Math.sin(t * 12) * 0.08 +
      mistShimmy.current * Math.sin(t * 15) * 0.2;

    // Squash/stretch + poke squish
    const squash = 1 + Math.sin(t * anim.bounceSpeed) * 0.02;
    const pokeSquish = 1 - pokeJolt.current * 0.08;
    groupRef.current.scale.set(
      1 / squash / pokeSquish,
      squash * pokeSquish,
      1 / squash / pokeSquish,
    );

    // Animation timing and switching
    // Check if we need to start a new animation
    const currentAction = currentAnimationRef.current ? actions[currentAnimationRef.current] : null;
    const isCurrentlyRunning = currentAction?.isRunning() ?? false;
    const timeSinceLastStart = t - lastAnimationStartTime.current;

    const shouldStartNewAnimation =
      (Object.keys(actions).length > 0) && // Actions are loaded
      (!currentAnimationRef.current || !isCurrentlyRunning) && // No animation or finished
      (timeSinceLastStart > 0.2); // Don't start too frequently

    if (shouldStartNewAnimation) {
      // Apply the movement offset from the animation that just finished
      const finishedAnimation = currentAnimationRef.current;
      if (finishedAnimation && ANIMATION_OFFSETS[finishedAnimation] !== undefined) {
        const offset = ANIMATION_OFFSETS[finishedAnimation];

        // Track consecutive movements
        if (finishedAnimation === "Bounce_Right") {
          consecutiveRightMoves.current++;
          consecutiveLeftMoves.current = 0;
        } else if (finishedAnimation === "Bounce_Left") {
          consecutiveLeftMoves.current++;
          consecutiveRightMoves.current = 0;
        } else {
          // Reset counters for non-movement animations
          consecutiveRightMoves.current = 0;
          consecutiveLeftMoves.current = 0;
        }

        basePositionX.current += offset;
        basePositionX.current = Math.max(-3, Math.min(3, basePositionX.current));
        groupRef.current.position.x = basePositionX.current;
      }

      // Filter animations based on consecutive move limits
      let availableAnimations = [...IDLE_ANIMATIONS];

      if (consecutiveRightMoves.current >= 3) {
        availableAnimations = availableAnimations.filter((a) => a !== "Bounce_Right");
      }

      if (consecutiveLeftMoves.current >= 3) {
        availableAnimations = availableAnimations.filter((a) => a !== "Bounce_Left");
      }

      // Pick next animation
      const nextAnimation = availableAnimations[
        Math.floor(Math.random() * availableAnimations.length)
      ];

      // Play the animation
      const action = actions[nextAnimation];
      if (action) {
        action.reset().setLoop(THREE.LoopOnce, 1).play();
        currentAnimationRef.current = nextAnimation;
        lastAnimationStartTime.current = t;
      }
    }
  });

  return (
    <>
      {!isDark && (
        <group ref={cuteGroupRef} onPointerDown={handlePoke}>
          <group scale={0.25}>
            <Clone object={cuteGltf.scene} castShadow receiveShadow />
          </group>
        </group>
      )}
      {isDark && (
        <group ref={evilGroupRef} onPointerDown={handlePoke}>
          <group scale={0.25}>
            <Clone object={evilGltf.scene} castShadow receiveShadow />
          </group>
        </group>
      )}
    </>
  );
}
