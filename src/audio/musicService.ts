class MusicService {
  private audio = new Audio('/music.mp3')
  private pending = false

  constructor() {
    this.audio.loop = true
    this.audio.volume = 0.3
  }

  play() {
    this.pending = true
    this.audio.play().catch(() => {
      // Autoplay blocked — retry on next user interaction
      const retry = () => {
        if (!this.pending) return
        this.audio.play().catch(() => {})
      }
      document.addEventListener('pointerdown', retry, { once: true })
    })
  }

  pause() {
    this.pending = false
    this.audio.pause()
  }

  stop() {
    this.pending = false
    this.audio.pause()
    this.audio.currentTime = 0
  }
}

export const music = new MusicService()
