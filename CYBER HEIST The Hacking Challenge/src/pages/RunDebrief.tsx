import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Shield, Terminal } from 'lucide-react'
import type { Difficulty, Result } from '../types'

type Props = {
  difficulty: Difficulty
  result: Result
  onComplete: () => void
}

const debriefModes: Record<Difficulty, { title: string; subtitle: string; events: string[] }> = {
  easy: {
    title: 'SECURE EXIT',
    subtitle: 'CALM CHANNEL // TRAINING NODE',
    events: [
      '[EXIT] Training route sealed.',
      '[AUDIT] Synthetic telemetry reviewed.',
      '[RESET] Virtual nodes returned to idle.',
      '[SCORE] Run total confirmed.',
      '[STATUS] Clean exit recorded.',
      '[READY] Debrief complete.',
    ],
  },
  medium: {
    title: 'SIGNAL TRACE',
    subtitle: 'EVIDENCE REVIEW // TRAINING NODE',
    events: [
      '[TRACE] Event chain reconstructed.',
      '[DECODE] Synthetic sequence resolved.',
      '[VERIFY] Evidence integrity confirmed.',
      '[SCORE] Run total confirmed.',
      '[ARCHIVE] Training report sealed.',
      '[READY] Debrief complete.',
    ],
  },
  hard: {
    title: 'INCIDENT RESPONSE',
    subtitle: 'HIGH ALERT // TRAINING NODE',
    events: [
      '[ALERT] High-intensity training run sealed.',
      '[CONTAIN] Virtual incident path isolated.',
      '[ANALYSIS] Response timeline reconciled.',
      '[SCORE] Run total confirmed.',
      '[RESET] Training node returned to standby.',
      '[READY] Debrief complete.',
    ],
  },
}

export default function RunDebrief({ difficulty, result, onComplete }: Props) {
  const reduceMotion = useReducedMotion()
  const [secondsLeft, setSecondsLeft] = useState(60)
  const mode = debriefModes[difficulty]
  const progress = ((60 - secondsLeft) / 60) * 100
  const eventCount = Math.min(mode.events.length, Math.floor((60 - secondsLeft) / 10) + 1)
  const visibleEvents = useMemo(() => mode.events.slice(0, eventCount), [eventCount, mode.events])
  const timeLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((remaining) => Math.max(remaining - 1, 0))
    }, 1000)
    const timeout = window.setTimeout(onComplete, 60_000)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [onComplete])

  return (
    <motion.div className="run-debrief-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section
        className={`run-debrief-card run-debrief-${difficulty}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-debrief-title"
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
      >
        <header className="run-debrief-header">
          <div>
            <p className="kicker">MISSION DEBRIEF // {difficulty.toUpperCase()} MODE</p>
            <h2 id="run-debrief-title">{mode.title}<span>.</span></h2>
            <p>{mode.subtitle}</p>
          </div>
          <div className="run-debrief-clock">
            <small>DEBRIEF SEQUENCE</small>
            <b>{timeLabel}</b>
          </div>
        </header>

        <div className={`run-debrief-visual run-debrief-visual-${difficulty}`} aria-hidden="true">
          {difficulty === 'easy' && (
            <div className="debrief-easy-orbit">
              <span><Shield size={27} /></span>
              <i className="debrief-easy-node debrief-easy-node-one" />
              <i className="debrief-easy-node debrief-easy-node-two" />
              <i className="debrief-easy-node debrief-easy-node-three" />
            </div>
          )}
          {difficulty === 'medium' && (
            <div className="debrief-medium-field">
              <div className="debrief-medium-grid">
                {['0F', '1A', 'C4', '7D', '2B', 'E8', '93', '5C', 'A1', '6E', '3F', 'B0'].map((tile, index) => (
                  <span key={tile} style={{ animationDelay: `${index * 75}ms` }}>{tile}</span>
                ))}
              </div>
              <i className="debrief-medium-scan" />
            </div>
          )}
          {difficulty === 'hard' && (
            <div className="debrief-hard-field">
              <div className="debrief-hard-alert"><Terminal size={15} /> RESPONSE WINDOW // ACTIVE</div>
              <div className="debrief-hard-bars">
                {Array.from({ length: 24 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 35}ms` }} />)}
              </div>
              <span className="debrief-hard-ring" />
            </div>
          )}
        </div>

        <div className="run-debrief-summary">
          <div><small>FINAL SCORE</small><b>{result.total_score.toLocaleString()} PTS</b></div>
          <div><small>OBJECTIVES</small><b>{result.correct_answers} / {result.total_questions}</b></div>
          <div><small>TRAINING ENVIRONMENT</small><b>LOCAL SANDBOX · NO LIVE SYSTEMS</b></div>
        </div>

        <div className="run-debrief-log" role="log" aria-live="polite" aria-relevant="additions">
          {visibleEvents.map((line, index) => (
            <motion.p
              key={line}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : index === visibleEvents.length - 1 ? 0.1 : 0 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <div className="run-debrief-progress"><span style={{ width: `${progress}%` }} /></div>
        <footer className="run-debrief-footer">
          <span>TRAINING SANDBOX // NO EXTERNAL SYSTEMS ACCESSED</span>
          <button className="button button-outline" onClick={onComplete}>SKIP TO RESULTS <ArrowRight size={14} /></button>
        </footer>
      </motion.section>
    </motion.div>
  )
}
