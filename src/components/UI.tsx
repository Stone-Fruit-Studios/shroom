import styles from './UI.module.css'

export default function UI() {
  return (
    <div className={styles.overlay}>
      <div className={styles.info}>WASD to move — Space to jump</div>
    </div>
  )
}
