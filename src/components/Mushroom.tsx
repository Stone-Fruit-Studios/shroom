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

const IDLE_ANIMATIONS = ["Bounce_Right", "Bounce_Left", "Hop", "Idle_Wobble"];
const RESTLESS_ANIMATION = "Restless_Hop";

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
  // Load the GLB model
  const gltf = useGLTF("/Mushroom-cute.glb");

  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

  // Animation system
  const { actions, names } = useAnimations(gltf.animations, groupRef);
  const currentAnimationRef = useRef<string | null>(null);
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
    const currentAction = currentAnimationRef.current
      ? actions[currentAnimationRef.current]
      : null;

    // Check if current animation has finished
    if (currentAction && !currentAction.isRunning()) {
      // Apply the movement offset from the animation that just finished
      const finishedAnimation = currentAnimationRef.current;
      if (finishedAnimation) {
        const offset = ANIMATION_OFFSETS[finishedAnimation] || 0;

        // Track consecutive movements
        if (finishedAnimation === "Bounce_Right") {
          consecutiveRightMoves.current++;
          consecutiveLeftMoves.current = 0;
        } else if (finishedAnimation === "Bounce_Left") {
          consecutiveLeftMoves.current++;
          consecutiveRightMoves.current = 0;
        }

        basePositionX.current += offset;

        // Clamp to bounds
        basePositionX.current = Math.max(
          -3,
          Math.min(3, basePositionX.current),
        );

        // Apply the new position immediately (teleport)
        groupRef.current.position.x = basePositionX.current;

        console.log(
          `${finishedAnimation} finished, moved by ${offset}, now at X:`,
          basePositionX.current,
        );
      }

      const isHungry = hunger >= BEHAVIOR.hungerThreshold;
      const isBored = boredom >= BEHAVIOR.boredomThreshold;

      let nextAnimation: string;

      // Play Restless_Hop if hungry or bored, otherwise random idle
      if ((isHungry || isBored) && actions[RESTLESS_ANIMATION]) {
        nextAnimation = RESTLESS_ANIMATION;
        console.log("Playing restless animation");
      } else {
        // Filter animations based on consecutive move limits
        let availableAnimations = [...IDLE_ANIMATIONS];

        // Can't do more than 3 consecutive rights without a left
        if (consecutiveRightMoves.current >= 3) {
          availableAnimations = availableAnimations.filter(
            (a) => a !== "Bounce_Right",
          );
          console.log("Blocking Bounce_Right (3 consecutive)");
        }

        // Can't do more than 3 consecutive lefts without a right
        if (consecutiveLeftMoves.current >= 3) {
          availableAnimations = availableAnimations.filter(
            (a) => a !== "Bounce_Left",
          );
          console.log("Blocking Bounce_Left (3 consecutive)");
        }

        nextAnimation =
          availableAnimations[
            Math.floor(Math.random() * availableAnimations.length)
          ];
        console.log(
          "Playing random idle:",
          nextAnimation,
          "from position",
          basePositionX.current,
        );
      }

      // Play next animation (non-looping)
      if (actions[nextAnimation]) {
        actions[nextAnimation]
          ?.reset()
          .setLoop(THREE.LoopOnce, 1)
          .fadeIn(0.3)
          .play();

        currentAnimationRef.current = nextAnimation;
      } else {
        console.warn(
          "Animation not found:",
          nextAnimation,
          "Available:",
          Object.keys(actions),
        );
      }
    }
  });

  return (
    <group ref={groupRef} onPointerDown={handlePoke}>
      <group ref={modelRef} scale={0.25}>
        <Clone object={gltf.scene} castShadow receiveShadow />
      </group>
    </group>
  );
}
