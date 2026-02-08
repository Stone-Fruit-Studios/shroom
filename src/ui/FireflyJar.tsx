import { useCallback, useEffect, useRef } from 'react'
import { useFireflyStore } from '../stores/fireflyStore'
import classNames from 'classnames'
import styles from './FireflyJar.module.css'

export default function FireflyJar() {
  const { phase, jarCount, coolingDown, pressing } = useFireflyStore()
  const disabled = coolingDown
  const active = phase === 'scooping'
  const hasFireflies = jarCount > 0
  const jarRef = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    useFireflyStore.getState().toggleJar(e.clientX, e.clientY)
  }, [])

  // Window-level listeners for scooping drag (only active when phase === 'scooping')
  useEffect(() => {
    if (!active) return

    const onDown = (e: PointerEvent) => {
      // Ignore clicks on UI elements (jar button, food tray, etc.)
      if (jarRef.current?.contains(e.target as Node)) return
      if ((e.target as Element)?.closest?.('[data-hud-action]')) return
      useFireflyStore.getState().startScoop(e.clientX, e.clientY)
    }
    const onMove = (e: PointerEvent) => {
      useFireflyStore.getState().updateDrag(e.clientX, e.clientY)
    }
    const onUp = () => {
      useFireflyStore.getState().endScoop()
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [active])

  return (
    <>
      <div className={styles.wrapper} data-hud-action>
        <div
          ref={jarRef}
          className={classNames(
            styles.jar,
            disabled && styles.empty,
          )}
          onPointerDown={onPointerDown}
        >
          <span className={styles.emoji}>🫙</span>
          {hasFireflies && <span className={styles.count}>{jarCount}</span>}
        </div>
        <span className={styles.label}>Fireflies</span>
      </div>
      {active && !pressing && !hasFireflies && (
        <div className={styles.hint}>Press &amp; hold near fireflies to catch</div>
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
    </>
  )
}
