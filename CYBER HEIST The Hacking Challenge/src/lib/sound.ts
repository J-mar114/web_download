import { Howl, Howler } from 'howler'

const backgroundMusicUrl = new URL('../assets/joelfazhari-synthetic-deception-loopable-epic-cyberpunk-crime-music-157454 (1).mp3', import.meta.url).href

type SoundCue = 'click' | 'countdown' | 'launch' | 'correct' | 'wrong' | 'hint' | 'next' | 'complete' | 'warning'
type Note = { start: number; duration: number; from: number; to?: number; volume: number; wave?: 'sine' | 'square'; decay?: number }

const sounds = new Map<SoundCue, Howl>()
let backgroundMusic: Howl | null = null

const cues: Record<SoundCue, { duration: number; notes: Note[] }> = {
  click: {
    duration: 0.075,
    notes: [
      { start: 0, duration: 0.055, from: 1600, to: 950, volume: 0.07, wave: 'square', decay: 75 },
      { start: 0, duration: 0.075, from: 390, to: 180, volume: 0.17, decay: 45 },
    ],
  },
  countdown: {
    duration: 0.12,
    notes: [{ start: 0, duration: 0.11, from: 950, to: 760, volume: 0.2, decay: 28 }],
  },
  launch: {
    duration: 0.52,
    notes: [
      { start: 0, duration: 0.2, from: 392, to: 494, volume: 0.35 },
      { start: 0.13, duration: 0.25, from: 587, to: 784, volume: 0.28 },
    ],
  },
  correct: {
    duration: 0.55,
    notes: [
      { start: 0, duration: 0.34, from: 523, volume: 0.3 },
      { start: 0.09, duration: 0.34, from: 659, volume: 0.28 },
      { start: 0.18, duration: 0.36, from: 784, volume: 0.24 },
    ],
  },
  wrong: {
    duration: 0.42,
    notes: [
      { start: 0, duration: 0.32, from: 210, to: 105, volume: 0.48 },
      { start: 0.08, duration: 0.26, from: 160, to: 80, volume: 0.25 },
    ],
  },
  hint: {
    duration: 0.36,
    notes: [
      { start: 0, duration: 0.2, from: 990, to: 740, volume: 0.3 },
      { start: 0.12, duration: 0.19, from: 660, to: 880, volume: 0.22 },
    ],
  },
  next: {
    duration: 0.24,
    notes: [{ start: 0, duration: 0.18, from: 460, to: 820, volume: 0.28 }],
  },
  complete: {
    duration: 0.95,
    notes: [
      { start: 0, duration: 0.62, from: 392, volume: 0.27 },
      { start: 0.12, duration: 0.65, from: 494, volume: 0.25 },
      { start: 0.24, duration: 0.68, from: 587, volume: 0.22 },
      { start: 0.36, duration: 0.58, from: 784, volume: 0.2 },
    ],
  },
  warning: {
    duration: 0.2,
    notes: [
      { start: 0, duration: 0.11, from: 740, to: 620, volume: 0.17, decay: 32 },
      { start: 0.1, duration: 0.1, from: 620, to: 490, volume: 0.13, decay: 34 },
    ],
  },
}

function wavSource(duration: number, sampleAt: (time: number) => number) {
  const sampleRate = 22050
  const sampleCount = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(buffer)
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) view.setUint8(offset + index, text.charCodeAt(index))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, sampleCount * 2, true)
  for (let index = 0; index < sampleCount; index++) {
    const sample = Math.max(-1, Math.min(1, sampleAt(index / sampleRate)))
    view.setInt16(44 + index * 2, sample * 32767, true)
  }
  let binary = ''
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)
  return `data:audio/wav;base64,${btoa(binary)}`
}

function cueSource(cue: SoundCue) {
  const { duration, notes } = cues[cue]
  return wavSource(duration, (time) => {
    let mix = 0
    for (const note of notes) {
      const elapsed = time - note.start
      if (elapsed < 0 || elapsed > note.duration) continue
      const progress = elapsed / note.duration
      const phase = 2 * Math.PI * (note.from * elapsed + ((note.to ?? note.from) - note.from) * elapsed * progress / 2)
      const envelope = note.decay
        ? Math.min(1, elapsed / 0.0015) * Math.exp(-elapsed * note.decay)
        : Math.min(1, elapsed / 0.012) * Math.max(0, Math.min(1, (note.duration - elapsed) / 0.06))
      const waveform = note.wave === 'square' ? Math.sign(Math.sin(phase)) : Math.sin(phase)
      mix += waveform * envelope * note.volume
    }
    return mix
  })
}

export function setSoundMuted(muted: boolean) {
  Howler.mute(muted)
  if (muted) backgroundMusic?.stop()
}

export function setBackgroundMusicActive(active: boolean, muted: boolean) {
  if (!active || muted) {
    backgroundMusic?.stop()
    return
  }
  backgroundMusic ??= new Howl({ src: [backgroundMusicUrl], format: ['mp3'], loop: true, volume: 0.3 })
  if (!backgroundMusic.playing()) backgroundMusic.play()
}

export function playGameSound(cue: SoundCue, muted: boolean) {
  if (muted) return
  let sound = sounds.get(cue)
  if (!sound) {
    sound = new Howl({ src: [cueSource(cue)], format: ['wav'], volume: 0.72 })
    sounds.set(cue, sound)
  }
  sound.play()
}
