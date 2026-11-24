import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Fingerprint, Terminal, Wifi, X } from 'lucide-react'
import type { Difficulty } from '../types'

type Props = {
  difficulty: Difficulty
  onClose: () => void
}

export default function SimulationPreview({ difficulty, onClose }: Props) {
  const reduceMotion = useReducedMotion()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const steps = useMemo(() => [
    `[BOOT] ${difficulty.toUpperCase()} visual profile loaded.`,
    '[MAP] Synthetic training node SIM-07 discovered.',
    '[TRACE] Fictional route visualized inside the local sandbox.',
    '[ANALYSIS] Mock service metadata reviewed.',
    '[ISOLATION] No live systems or network traffic involved.',
    '[COMPLETE] Visual simulation finished successfully.',
  ], [difficulty])

  useEffect(() => {
    if (!running) return

    const timer = window.setTimeout(() => {
      const nextIndex = logs.length
      const nextLog = steps[nextIndex]
      if (!nextLog) {
        setRunning(false)
        return
      }

      setLogs((current) => [...current, nextLog])
      setProgress(Math.round(((nextIndex + 1) / steps.length) * 100))
      if (nextIndex + 1 === steps.length) setRunning(false)
    }, reduceMotion ? 80 : 480)

    return () => window.clearTimeout(timer)
  }, [logs.length, reduceMotion, running, steps])

  function runSimulation() {
    setLogs([])
    setProgress(0)
    setRunning(true)
  }

  return (
    <motion.div
      className="simulation-preview-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        className="simulation-preview panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="simulation-preview-title"
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.99 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
      >
        <header className="simulation-preview-header">
          <div>
            <p className="kicker">LOCAL TRAINING MODULE // {difficulty.toUpperCase()}</p>
            <h2 id="simulation-preview-title">Simulation <span>preview.</span></h2>
          </div>
          <button className="simulation-preview-close" onClick={onClose} aria-label="Close simulation preview">
            <X size={19} />
          </button>
        </header>

        <div className="simulation-preview-status">
          <span><i /> ISOLATED SANDBOX</span>
          <span>NO LIVE NETWORK</span>
          <span>{running ? 'SEQUENCE ACTIVE' : progress === 100 ? 'SEQUENCE COMPLETE' : 'READY TO RUN'}</span>
        </div>

        <div className={`simulation-preview-map${running ? ' simulation-preview-map-active' : ''}`} aria-hidden="true">
          <div className="simulation-preview-node">
            <Fingerprint size={19} />
            <b>OPERATOR</b>
            <small>LOCAL CLIENT</small>
          </div>
          <div className="simulation-preview-link"><i /></div>
          <div className="simulation-preview-node simulation-preview-target">
            <Terminal size={19} />
            <b>TRAINING NODE</b>
            <small>SIM-07 // FAKE TARGET</small>
          </div>
        </div>

        <section className="simulation-preview-console" aria-label="Simulation event log">
          <div className="simulation-preview-console-header">
            <span><Terminal size={13} /> SYNTHETIC EVENT STREAM</span>
            <span className="simulation-preview-local"><Wifi size={12} /> LOCAL ONLY</span>
          </div>
          <div className="simulation-preview-log" role="log" aria-live="polite" aria-relevant="additions">
            {logs.length === 0
              ? <p className="simulation-preview-idle">[READY] Start the visual sequence when you are ready.</p>
              : logs.map((log, index) => (
                <motion.p
                  key={`${index}-${log}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  {log}
                </motion.p>
              ))}
          </div>
          <div className="simulation-preview-progress"><span style={{ width: `${progress}%` }} /></div>
        </section>

        <div className="simulation-preview-controls">
          <div><small>SIMULATED PROGRESS</small><b>{String(progress).padStart(3, '0')}%</b></div>
          <button className="button button-primary" onClick={runSimulation} disabled={running}>
            {running ? 'SIMULATION RUNNING…' : progress === 100 ? 'REPLAY SIMULATION' : 'RUN SIMULATION'}
            {!running && <ArrowRight size={15} />}
          </button>
        </div>
        <p className="simulation-preview-disclaimer">VISUAL DEMO ONLY · No real target, passwords, or network requests are used.</p>
      </motion.section>
    </motion.div>
  )
}
