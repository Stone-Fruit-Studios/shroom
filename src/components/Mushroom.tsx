import { useRef, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
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

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Mushroom() {
  // Load the GLB model
  const gltf = useGLTF("/Mushroom-cute.glb");

  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

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

    // Position: base bounce + feed bounce + poke jolt + mist shiver
    const verticalOffset = -0.5; // Move mushroom down
    groupRef.current.position.y =
      anim.baseY +
      verticalOffset +
      Math.sin(t * anim.bounceSpeed) * anim.bounceAmt +
      feedBounce.current * Math.sin(t * 8) * 0.15 +
      mistShimmy.current * Math.sin(t * 18) * 0.04;
    groupRef.current.position.x =
      pokeJolt.current * Math.sin(t * 20) * 0.05 +
      mistShimmy.current * Math.sin(t * 22) * 0.03;

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
  });

  return (
    <group ref={groupRef} onPointerDown={handlePoke}>
      <group ref={modelRef} scale={0.25}>
        <Clone object={gltf.scene} castShadow receiveShadow />
      </group>
    </group>
  );
}
