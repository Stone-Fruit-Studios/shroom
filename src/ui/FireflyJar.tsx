import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useFireflyStore } from "../stores/fireflyStore";
import classNames from "classnames";
import styles from "./FireflyJar.module.css";

function JarModel() {
  const gltf = useGLTF("/jar.glb");
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.6;
  });

  return (
    <group ref={ref} scale={0.8} rotation={[0.3, 0.2, 0]} position={[0, 0, 0]}>
      <Clone object={gltf.scene} />
    </group>
  );
}

function JarIcon() {
  return (
    <Canvas
      style={{ width: 56, height: 56, pointerEvents: "none" }}
      camera={{ position: [0, 0, 5], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      <Suspense fallback={null}>
        <JarModel />
      </Suspense>
    </Canvas>
  );
}

export default function FireflyJar() {
  const { phase, jarCount, coolingDown, pressing } = useFireflyStore();
  const disabled = coolingDown;
  const active = phase === "scooping";
  const hasFireflies = jarCount > 0;
  const jarRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    useFireflyStore.getState().toggleJar(e.clientX, e.clientY);
  }, []);

  // Hide system cursor when scooping
  useEffect(() => {
    if (!active) return;
    const style = document.createElement("style");
    style.textContent = "* { cursor: none !important; }";
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [active]);

  // Window-level listeners for scooping drag (only active when phase === 'scooping')
  useEffect(() => {
    if (!active) return;

    const onDown = (e: PointerEvent) => {
      // Ignore clicks on UI elements (jar button, food tray, etc.)
      if (jarRef.current?.contains(e.target as Node)) return;
      if ((e.target as Element)?.closest?.("[data-hud-action]")) return;
      useFireflyStore.getState().startScoop(e.clientX, e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      useFireflyStore.getState().updateDrag(e.clientX, e.clientY);
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const onUp = () => {
      useFireflyStore.getState().endScoop();
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [active]);

  return (
    <>
      <div className={styles.wrapper} data-hud-action>
        <div
          ref={jarRef}
          className={classNames(styles.jarGlb, disabled && styles.empty)}
          onPointerDown={onPointerDown}
        >
          <JarIcon />
          {hasFireflies && <span className={styles.count}>{jarCount}</span>}
        </div>
        <span className={styles.label}>Fireflies</span>
      </div>
      {active && !pressing && !hasFireflies && (
        <div className={styles.hint}>
          Press &amp; hold near fireflies to catch
        </div>
      )}
      {active && pressing && !hasFireflies && (
        <div className={styles.hint}>Move over fireflies to catch!</div>
      )}
      {active && !pressing && hasFireflies && (
        <div className={styles.hint}>Tap mushroom to gift!</div>
      )}
      {active && pressing && hasFireflies && (
        <div className={styles.hint}>Catching... ({jarCount})</div>
      )}

      {active &&
        createPortal(
          <div className={styles.scoopOverlay}>
            <div
              className={styles.jarCursor}
              style={{ left: cursorPos.x, top: cursorPos.y }}
            >
              <Canvas
                style={{ width: 80, height: 80, pointerEvents: "none" }}
                camera={{ position: [0, 0, 5], fov: 30 }}
                gl={{ alpha: true, antialias: true }}
              >
                <ambientLight intensity={1.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <Suspense fallback={null}>
                  <JarModel />
                </Suspense>
              </Canvas>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
