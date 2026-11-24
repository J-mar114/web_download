import {
  ArrowDown, ArrowRight, Clock3, Command, Radio, Shield, Trophy, Zap,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Score } from '../types'

type Props = {
  scores: Score[]
  participantCount: number
  leaderboardError: string
  todayLabel: string
  onPlay: () => void
  onLeaderboard: () => void
}

export default function LandingPage({
  scores, participantCount, leaderboardError, todayLabel, onPlay, onLeaderboard,
}: Props) {
  const reduceMotion = useReducedMotion()
  const terminalLineMotion = (delay: number) => ({
    initial: reduceMotion ? false as const : { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: reduceMotion ? 0 : 0.32, delay: reduceMotion ? 0 : delay },
  })

  return (
    <div className="page home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A CYBERSECURITY ARCADE EXPERIENCE <span className="eyebrow-line" /></div>
          <h1>BREAK THE SYSTEM.<br /><span>CLAIM YOUR RANK.</span></h1>
          <p className="hero-description">Five challenges. One secure network. Think like a defender, move like a ghost, and prove you belong on the leaderboard.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onPlay}>PLAY NOW <ArrowRight size={17} /></button>
            <a className="button button-outline" href="#how-to-play">HOW TO PLAY <ArrowDown size={15} /></a>
          </div>
          <div className="hero-meta"><span><Shield size={15} /> SAFE SIMULATION</span><span><Clock3 size={15} /> ~10 MIN RUN</span><span><Zap size={15} /> 5 LIVE CHALLENGES</span></div>
        </div>
        <div className="hero-visual" aria-label="Cybersecurity terminal illustration">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="visual-crosshair"><span /><span /></div>
          <div className="terminal-card">
            <div className="terminal-top"><span><i /><i /><i /></span><small>SECURE SHELL // 10.0.4.21</small><span className="terminal-lock"><Command size={12} /></span></div>
            <div className="terminal-body">
              <motion.p {...terminalLineMotion(0.25)}><span className="terminal-green">operator@csit</span>:~$ initiate --heist</motion.p>
              <motion.p className="terminal-muted" {...terminalLineMotion(0.7)}>[+] Establishing encrypted tunnel...</motion.p>
              <motion.p className="terminal-muted" {...terminalLineMotion(1.15)}>[+] Proxy chain verified <span className="terminal-green">OK</span></motion.p>
              <motion.p className="terminal-muted" {...terminalLineMotion(1.6)}>[+] Training sandbox isolated</motion.p>
              <motion.p className="terminal-muted" {...terminalLineMotion(2.05)}>[*] Awaiting your command<span className="cursor">_</span></motion.p>
              <div className="terminal-progress"><span /></div>
            </div>
          </div>
          <div className="float-chip chip-top"><Radio size={14} /> NETWORK SECURE</div>
          <div className="float-chip chip-bottom"><span className="mini-bars"><i /><i /><i /><i /><i /></span> SIGNAL 98.4%</div>
        </div>
        <div className="hero-index">01 <span>/</span> 05 <i /></div>
      </section>

      <section className="stats-strip">
        <div><small>EVENT STATUS</small><b><span className="status-dot" /> SYSTEMS ONLINE</b></div>
        <div><small>CHALLENGES PER RUN</small><b>05 <span className="stat-muted">/ RANDOM SET</span></b></div>
        <div><small>UNIQUE OPERATORS</small><b>{participantCount ? String(participantCount).padStart(2, '0') : '--'} <span className="stat-muted">/ SCORED</span></b></div>
        <div><small>EVENT DATE</small><b>{todayLabel.toUpperCase()}</b></div>
      </section>

      <section id="how-to-play" className="section challenge-section">
        <div className="section-heading"><div><p className="kicker">HOW TO PLAY</p><h2>Type commands. <span>Follow the evidence.</span></h2></div><p>Complete five randomly selected objectives in an isolated training terminal. No real systems are accessed.</p></div>
        <div className="howto-steps">
          <article className="howto-step"><span className="howto-step-number">01 // START</span><h3>Launch your run</h3><p>Choose a difficulty, optionally preview the local simulation, then select <strong>START HEIST</strong> to load your first objective.</p></article>
          <article className="howto-step"><span className="howto-step-number">02 // SCAN</span><h3>Map the training node</h3><p>In the terminal, type <code>scan</code> and press Enter or RUN.</p></article>
          <article className="howto-step"><span className="howto-step-number">03 // INSPECT</span><h3>Read the evidence</h3><p>Type <code>inspect</code> to see the clues and candidate findings. This displays evidence; it does not submit an answer.</p></article>
          <article className="howto-step"><span className="howto-step-number">04 // ANALYZE</span><h3>Submit your finding</h3><p>Use <code>analyze B</code> for candidate B, or <code>analyze blue2024</code> to enter a finding directly. Include <code>analyze</code> before your answer.</p></article>
          <article className="howto-step"><span className="howto-step-number">05 // CONTINUE</span><h3>Move to the next objective</h3><p>After the objective is resolved, type <code>next</code>. Need help? <code>hint</code> costs 25 points.</p></article>
        </div>
        <div className="howto-commands"><span>OTHER COMMANDS</span><p>Each resolved objective plays a brief local-only debrief · <code>simulate auth-lab</code> is an optional visual demo in password missions · <code>hint</code> costs 25 points · <code>help</code>, <code>status</code>, and <code>clear</code> provide command help, run status, and terminal cleanup</p></div>
        <div className="section-heading mission-types-heading"><div><p className="kicker">MISSION TYPES</p><h2>Five ways to <span>outsmart the system.</span></h2></div><p>Every run draws a fresh set. Stay sharp, use hints wisely, and keep your score.</p></div>
        <div className="challenge-grid">
          {[
            ['01', 'PASSWORD CRACK', 'Read the clues. Find the weak credential.', '01'],
            ['02', 'CODE BREAKER', 'Decode a message before the clock runs out.', '⌘'],
            ['03', 'LOG ANALYSIS', 'Spot the anomaly hiding in the noise.', '≋'],
            ['04', 'SECURITY BREACH', 'Choose the safest move in the scenario.', '⬡'],
            ['05', 'DIGITAL FORENSICS', 'Follow the evidence. Find the signal.', '⌕'],
          ].map(([num, title, copy, icon]) => (
            <article className="challenge-tile" key={num}><span className="tile-icon">{icon}</span><small>CHALLENGE {num}</small><h3>{title}</h3><p>{copy}</p><span className="tile-arrow"><ArrowRight size={15} /></span></article>
          ))}
        </div>
      </section>

      <section className="leader-preview">
        <div className="section-heading"><div><p className="kicker">THE OPERATORS</p><h2>Top <span>runners.</span></h2></div><button className="text-link" onClick={onLeaderboard}>FULL LEADERBOARD <ArrowRight size={15} /></button></div>
        <div className="preview-table">
          {scores.slice(0, 3).map((entry) => <div className="preview-row" key={`${entry.rank}-${entry.player_name}`}><span className={`rank rank-${entry.rank}`}>#{String(entry.rank).padStart(2, '0')}</span><span className="operator-avatar">{entry.player_name.slice(0, 1).toUpperCase()}</span><b>{entry.player_name}</b><span className="row-category">{entry.correct_answers}/{entry.total_questions} OBJECTIVES</span><strong>{entry.total_score.toLocaleString()} <small>PTS</small></strong></div>)}
          {scores.length === 0 && <div className="empty-table"><Trophy size={20} /><span>{leaderboardError || 'No verified runs yet. Be the first to claim a spot.'}</span></div>}
        </div>
      </section>

      <section className="final-cta"><div><p className="kicker">THE NETWORK IS WAITING</p><h2>Ready to make <span>your move?</span></h2></div><button className="button button-primary" onClick={onPlay}>ENTER THE HEIST <ArrowRight size={17} /></button></section>
    </div>
  )
}
