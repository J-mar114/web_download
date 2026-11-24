import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown, ArrowLeft, ArrowRight, AudioLines, Check, ChevronDown, Clock3,
  Command, Crosshair, ExternalLink, Fingerprint, LockKeyhole, Menu, Shield,
  ShieldAlert, Terminal, Trophy, Wifi, X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { challengeIcons, formatTime } from './lib/game'
import { playGameSound, setBackgroundMusicActive, setSoundMuted } from './lib/sound'
import { supabase, supabaseConfigured } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import LeaderboardPage from './pages/LeaderboardPage'
import RunDebrief from './pages/RunDebrief'
import SimulationPreview from './pages/SimulationPreview'
import { invoke } from './services/gameApi'
import type {
  AdminChallenge, AdminSessionDetail, Challenge, Difficulty, Feedback,
  LeaderboardFilter, Page, Result, Score, Session,
} from './types'
import './App.css'

type TerminalLine = {
  id: string
  kind: 'system' | 'command' | 'output' | 'success' | 'error'
  text: string
}

type SimulationStage = 'scan' | 'inspect' | 'solve' | 'debrief'

const matrixStreams = Array.from({ length: 14 }, (_, index) => ({
  left: `${4 + index * 7}%`,
  duration: `${7 + (index % 5) * 1.1}s`,
  delay: `${-((index % 7) * 1.2)}s`,
  opacity: 0.08 + (index % 3) * 0.035,
  glyphs: Array.from({ length: 14 }, (_, row) => ((index * 17 + row * 11) % 16).toString(16).toUpperCase()).join('\n'),
}))

const completionSimulationLabels: Record<Challenge['challenge_type'], string> = {
  password: 'AUTH MODULE',
  code: 'CIPHER MODULE',
  log_analysis: 'LOG CORRELATION',
  security_breach: 'DEFENSE RESPONSE',
  digital_forensics: 'FORENSIC TRACE',
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [nickname, setNickname] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [modal, setModal] = useState<'register' | 'exit' | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [muted, setMuted] = useState(false)
  const [scores, setScores] = useState<Score[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [scoreFilter, setScoreFilter] = useState<LeaderboardFilter>('all')
  const [leaderboardError, setLeaderboardError] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [commandInput, setCommandInput] = useState('')
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [typingLineId, setTypingLineId] = useState<string | null>(null)
  const [simulationStage, setSimulationStage] = useState<SimulationStage>('scan')
  const [authDemoProgress, setAuthDemoProgress] = useState<number | null>(null)
  const [levelCompletionProgress, setLevelCompletionProgress] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [hint, setHint] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminReady, setAdminReady] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [simulationPreviewOpen, setSimulationPreviewOpen] = useState(false)
  const [showRunDebrief, setShowRunDebrief] = useState(false)
  const [adminData, setAdminData] = useState<{ total_players: number; games_played: number; average_score: number; highest_score: number; recent_games: Score[] } | null>(null)
  const [adminChallenges, setAdminChallenges] = useState<AdminChallenge[]>([])
  const [selectedSession, setSelectedSession] = useState<AdminSessionDetail | null>(null)
  const [challengeEditor, setChallengeEditor] = useState<Record<string, string> | null>(null)
  const [currentScore, setCurrentScore] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const finishGameRef = useRef<() => void>(() => {})
  const startGameRef = useRef<() => void>(() => {})
  const terminalEndRef = useRef<HTMLDivElement | null>(null)
  const authDemoCompletionReported = useRef(false)
  const reduceMotion = useReducedMotion()

  const currentChallenge = session?.challenges[questionIndex]
  const CurrentIcon = currentChallenge
    ? challengeIcons[currentChallenge.challenge_type] || Crosshair
    : Crosshair
  const todayLabel = useMemo(() => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()), [])
  const closeRunDebrief = useCallback(() => setShowRunDebrief(false), [])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: typingLineId ? 'auto' : 'smooth', block: 'nearest' })
  }, [terminalLines, busy, typingLineId])

  useEffect(() => {
    if (authDemoProgress === null || authDemoProgress >= 100) return
    const timer = window.setTimeout(() => {
      setAuthDemoProgress((progress) => progress === null ? null : Math.min(progress + 10, 100))
    }, 160)
    return () => window.clearTimeout(timer)
  }, [authDemoProgress])

  useEffect(() => {
    if (levelCompletionProgress === null || levelCompletionProgress >= 100) return
    const timer = window.setTimeout(() => {
      setLevelCompletionProgress((progress) => progress === null ? null : Math.min(progress + 10, 100))
    }, reduceMotion ? 20 : 160)
    return () => window.clearTimeout(timer)
  }, [levelCompletionProgress, reduceMotion])

  useEffect(() => {
    if (authDemoProgress !== 100 || authDemoCompletionReported.current) return
    authDemoCompletionReported.current = true
    setTerminalLines((lines) => [...lines, {
      id: crypto.randomUUID(),
      kind: 'success',
      text: '[LAB] Visual demo complete. Synthetic activity only; no passwords tested and no network traffic sent.',
    }])
  }, [authDemoProgress])

  useEffect(() => {
    void loadLeaderboard()
  }, [])

  useEffect(() => {
    if (!supabaseConfigured || page !== 'leaderboard') return
    const channel = supabase!.channel('public-leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_entries' }, () => void loadLeaderboard())
      .subscribe()
    return () => { void supabase!.removeChannel(channel) }
  }, [page, scoreFilter])

  useEffect(() => {
    if (page !== 'game') return
    const timer = window.setInterval(() => {
      setSecondsLeft((remaining) => Math.max(0, remaining - 1))
      setElapsed((value) => value + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [page])

  useEffect(() => {
    setBackgroundMusicActive(true, muted)
    return () => setBackgroundMusicActive(false, true)
  }, [muted])

  useEffect(() => {
    if (page !== 'game' || muted || secondsLeft <= 0) return
    if (secondsLeft <= 5 || [60, 30, 15, 10].includes(secondsLeft)) playGameSound('warning', muted)
  }, [muted, page, secondsLeft])

  useEffect(() => {
    if (page === 'game' && secondsLeft === 0) finishGameRef.current()
  }, [secondsLeft, page])

  useEffect(() => {
    if (countdown === null) return
    const timer = window.setTimeout(() => {
      playGameSound(countdown === 1 ? 'launch' : 'countdown', muted)
      if (countdown <= 1) {
        setCountdown(null)
        startGameRef.current()
      } else {
        setCountdown(countdown - 1)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, muted])

  async function loadLeaderboard(filter: LeaderboardFilter = scoreFilter) {
    try {
      const data = await invoke<{ entries: Score[]; participant_count: number }>({ action: 'leaderboard', filter })
      setScores(data.entries)
      setParticipantCount(data.participant_count)
      setLeaderboardError('')
    } catch (error) {
      setScores([])
      setParticipantCount(0)
      setLeaderboardError(error instanceof Error ? error.message : 'Unable to load leaderboard.')
    }
  }

  function startRegistration() {
    setNotice('')
    setModal('register')
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = nickname.trim()
    if (cleanName.length < 3 || cleanName.length > 16 || !/^[a-zA-Z0-9_-]+$/.test(cleanName)) {
      setNotice('Use 3–16 letters, numbers, underscores, or hyphens.')
      return
    }
    setNotice('')
    if (supabaseConfigured) {
      setBusy(true)
      try {
        const availability = await invoke<{ available: boolean }>({ action: 'nickname_available', player_name: cleanName })
        if (!availability.available) {
          setNotice('That nickname is unavailable. Try another.')
          return
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Nickname availability could not be checked.')
        return
      } finally {
        setBusy(false)
      }
    }
    setNickname(cleanName)
    setModal(null)
    setPage('lobby')
  }

  function beginHeist() {
    setNotice('')
    playGameSound('click', muted)
    startGameRef.current = () => { void startHeist() }
    setCountdown(3)
  }

  async function startHeist() {
    setBusy(true)
    setNotice('')
    try {
      const data = await invoke<{ session_id: string; token: string; started_at: string; challenges: Challenge[] }>({
        action: 'start', player_name: nickname, difficulty,
      })
      setSession({ id: data.session_id, token: data.token, challenges: data.challenges })
      setQuestionIndex(0)
      initializeTerminal(data.challenges[0])
      setSecondsLeft(Math.max(0, 600 - Math.floor((Date.now() - Date.parse(data.started_at)) / 1000)))
      setElapsed(0)
      setCurrentScore(0)
      setFeedback(null)
      setHint('')
      setPage('game')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to start a heist.')
    } finally {
      setBusy(false)
    }
  }

  async function requestHint(): Promise<string | null> {
    if (!session || !currentChallenge || hint) return null
    setBusy(true)
    try {
      const data = await invoke<{ hint: string }>({
        action: 'hint', session_id: session.id, token: session.token, challenge_id: currentChallenge.id,
      })
      setHint(data.hint)
      playGameSound('hint', muted)
      return data.hint
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Hint unavailable.')
      return null
    } finally {
      setBusy(false)
    }
  }

  async function submitAnswer(value: string): Promise<Feedback | null> {
    if (!session || !currentChallenge || !value.trim() || busy || feedback?.is_correct || feedback?.attempts_left === 0) return null
    setBusy(true)
    setNotice('')
    setFeedback(null)
    try {
      const data = await invoke<Feedback>({
        action: 'submit', session_id: session.id, token: session.token,
        challenge_id: currentChallenge.id, submitted_answer: value.trim(), request_id: crypto.randomUUID(),
      })
      setFeedback(data)
      if (data.is_correct) setCurrentScore((value) => value + data.points_earned)
      playGameSound(data.is_correct ? 'correct' : 'wrong', muted)
      return data
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Answer could not be submitted.')
      return null
    } finally {
      setBusy(false)
    }
  }

  function writeTerminal(kind: TerminalLine['kind'], text: string) {
    setTerminalLines((lines) => [...lines, { id: crypto.randomUUID(), kind, text }])
  }

  async function writeTerminalTyping(kind: TerminalLine['kind'], text: string) {
    if (reduceMotion) {
      writeTerminal(kind, text)
      return
    }

    const id = crypto.randomUUID()
    setTypingLineId(id)
    setTerminalLines((lines) => [...lines, { id, kind, text: '' }])
    for (let index = 1; index <= text.length; index += 1) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 18))
      setTerminalLines((lines) => lines.map((line) => line.id === id ? { ...line, text: text.slice(0, index) } : line))
    }
    setTypingLineId(null)
  }

  function initializeTerminal(challenge: Challenge) {
    setSimulationStage('scan')
    setAuthDemoProgress(null)
    setLevelCompletionProgress(null)
    authDemoCompletionReported.current = false
    setTypingLineId(null)
    setCommandInput('')
    setTerminalLines([
      { id: crypto.randomUUID(), kind: 'system', text: '[SYS] Isolated training lab ready. No live systems are connected.' },
      { id: crypto.randomUUID(), kind: 'output', text: `[MISSION] ${challenge.challenge_type.replace('_', ' ').toUpperCase()} module loaded: ${challenge.title}` },
      { id: crypto.randomUUID(), kind: 'output', text: '[HELP] Type help to view simulation commands. Start with scan.' },
    ])
  }

  async function handleTerminalCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || typingLineId !== null || (authDemoProgress !== null && authDemoProgress < 100) || (levelCompletionProgress !== null && levelCompletionProgress < 100) || !currentChallenge) return
    const raw = commandInput.trim()
    if (!raw) return
    setCommandInput('')
    setNotice('')
    playGameSound('click', muted)
    writeTerminal('command', `operator@training-node:~$ ${raw}`)

    const separator = raw.search(/\s/)
    const command = (separator < 0 ? raw : raw.slice(0, separator)).toLowerCase()
    const argument = separator < 0 ? '' : raw.slice(separator).trim()

    if (command === 'clear') {
      setTerminalLines([
        { id: crypto.randomUUID(), kind: 'command', text: `operator@training-node:~$ ${raw}` },
        { id: crypto.randomUUID(), kind: 'system', text: '[SYS] Console cleared. Simulation state preserved.' },
      ])
      return
    }

    if (command === 'help') {
      writeTerminal('output', [
        'help                 list simulated commands',
        'status               view mission and simulation status',
        'scan                 scan the fictional training node',
        'inspect              read the current evidence packet',
        'simulate auth-lab    play the local visual demo (password missions)',
        'hint                 request one hint (-25 points)',
        'analyze <finding>    submit your analysis for validation',
        'submit <finding>     alias for analyze',
        'next                 continue after the objective is resolved',
        'clear                clear the terminal log',
      ].join('\n'))
      writeTerminal('system', 'Arbitrary shell commands and live network access are disabled.')
      return
    }

    if (command === 'status') {
      writeTerminal('output', `OBJECTIVE ${questionIndex + 1}/${session?.challenges.length ?? 5} | ${simulationStage.toUpperCase()} | SCORE ${currentScore} | TIME ${formatTime(secondsLeft)}`)
      return
    }

    if (command === 'scan') {
      if (simulationStage !== 'scan') {
        writeTerminal('output', '[SCAN] Training node already mapped. Type inspect to open the evidence packet.')
        return
      }
      const modules: Record<string, string> = {
        password: 'AUTH MODULE // SIMULATED',
        code: 'ENCODED PAYLOAD // READ-ONLY BUFFER',
        log_analysis: 'EVENT LOG // TRAINING DATASET',
        security_breach: 'INCIDENT REPORT // SIMULATION',
        digital_forensics: 'EVIDENCE IMAGE // READ-ONLY',
      }
      writeTerminal('success', `[SCAN] Synthetic node mapped: ${modules[currentChallenge.challenge_type] ?? 'TRAINING MODULE'}\n[SCAN] No network traffic sent. Evidence packet ready for inspection.`)
      setSimulationStage('inspect')
      return
    }

    if (command === 'simulate') {
      if (argument.toLowerCase() !== 'auth-lab') {
        writeTerminal('error', '[USAGE] simulate auth-lab')
        return
      }
      if (currentChallenge.challenge_type !== 'password') {
        writeTerminal('error', '[ERR] This visual demo is only available in password missions.')
        return
      }
      if (simulationStage === 'scan') {
        writeTerminal('error', '[ERR] Scan the fictional node before starting the demo.')
        return
      }
      if (simulationStage === 'debrief') {
        writeTerminal('error', '[ERR] This objective is already resolved.')
        return
      }
      if (authDemoProgress !== null) {
        writeTerminal('output', '[LAB] Visual demo already completed for this objective.')
        return
      }
      authDemoCompletionReported.current = false
      setAuthDemoProgress(0)
      writeTerminal('system', '[LAB] Starting visual-only auth demo. Synthetic counters; no credentials or network are used.')
      return
    }

    if (command === 'inspect') {
      if (simulationStage === 'scan') {
        writeTerminal('error', '[ERR] No packet found. Run scan first.')
        return
      }
      const candidates = currentChallenge.options?.length
        ? `\n\n[CANDIDATES]\n${currentChallenge.options.map((option, index) => `${String.fromCharCode(65 + index)} | ${option}`).join('\n')}`
        : ''
      writeTerminal('output', `[EVIDENCE PACKET]\n${currentChallenge.question}${candidates}`)
      if (simulationStage === 'inspect') setSimulationStage('solve')
      return
    }

    if (command === 'hint') {
      if (hint) {
        writeTerminal('output', `[INTEL] ${hint}`)
        return
      }
      if (simulationStage !== 'solve') {
        writeTerminal('error', '[ERR] Scan and inspect the packet before requesting intel.')
        return
      }
      const intel = await requestHint()
      if (intel) writeTerminal('success', `[INTEL] ${intel}\n[SYS] Hint penalty applied.`)
      return
    }

    if (command === 'analyze' || command === 'submit') {
      if (simulationStage !== 'solve') {
        writeTerminal('error', '[ERR] Scan and inspect the evidence packet before submitting a finding.')
        return
      }
      if (!argument) {
        writeTerminal('error', '[USAGE] analyze <finding>')
        return
      }
      const optionIndex = /^[a-e]$/i.test(argument) ? argument.toUpperCase().charCodeAt(0) - 65 : -1
      const finding = optionIndex >= 0 ? currentChallenge.options?.[optionIndex] ?? argument : argument.replace(/^(['"])(.*)\1$/, '$2')
      const response = await submitAnswer(finding)
      if (!response) return
      if (response.is_correct || response.attempts_left === 0) setSimulationStage('debrief')
      if (response.is_correct) {
        await writeTerminalTyping('success', `[VALIDATED] ${response.explanation}`)
      } else {
        writeTerminal('error', `[REJECTED] ${response.explanation}${response.attempts_left > 0 ? `\n[RETRY] ${response.attempts_left} attempt${response.attempts_left === 1 ? '' : 's'} remaining.` : ''}`)
      }
      if (response.is_correct || response.attempts_left === 0) setLevelCompletionProgress(0)
      if (response.points_earned > 0) writeTerminal('success', `[SCORE] +${response.points_earned} points.`)
      if (response.is_correct || response.attempts_left === 0) {
        writeTerminal('system', `Type next to ${questionIndex === (session?.challenges.length ?? 5) - 1 ? 'finish the run' : 'load the next objective'}.`)
      }
      return
    }

    if (command === 'next') {
      if (simulationStage !== 'debrief') {
        writeTerminal('error', '[ERR] Resolve this objective before moving on.')
        return
      }
      await goToNextChallenge()
      return
    }

    writeTerminal('error', `[ERR] Unknown simulated command "${command}". Type help. No shell command was executed.`)
  }

  async function goToNextChallenge() {
    if (!session) return
    if (questionIndex >= session.challenges.length - 1) {
      await finishGame(true)
      return
    }
    playGameSound('next', muted)
    const nextIndex = questionIndex + 1
    setQuestionIndex(nextIndex)
    initializeTerminal(session.challenges[nextIndex])
    setFeedback(null)
    setHint('')
    setNotice('')
  }

  async function finishGame(showDebrief = false) {
    if (!session || page === 'results') return
    setBusy(true)
    try {
      const data = await invoke<Result>({ action: 'finish', session_id: session.id, token: session.token })
      setResult(data)
      setPage('results')
      setShowRunDebrief(showDebrief)
      setModal(null)
      playGameSound('complete', muted)
      await loadLeaderboard()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to finish this game.')
    } finally {
      setBusy(false)
    }
  }
  finishGameRef.current = () => { void finishGame() }

  async function openAdmin() {
    setNotice('')
    setMobileMenuOpen(false)
    setPage('admin')
    if (supabase?.auth.getSession) {
      const { data } = await supabase.auth.getSession()
      setAdminReady(Boolean(data.session))
      if (data.session) void loadAdminDashboard()
    }
  }

  async function adminSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setNotice('Supabase is not configured. Add credentials from .env.example.')
      return
    }
    setBusy(true)
    setNotice('')
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword })
    if (error) setNotice(error.message)
    else {
      setAdminReady(true)
      await loadAdminDashboard()
    }
    setBusy(false)
  }

  async function loadAdminDashboard() {
    try {
      const [stats, challenges] = await Promise.all([
        invoke<typeof adminData>({ action: 'admin_summary' }),
        invoke<{ challenges: AdminChallenge[] }>({ action: 'admin_challenges' }),
      ])
      setAdminData(stats)
      setAdminChallenges(challenges.challenges)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load admin dashboard.')
    }
  }

  async function showSessionDetails(sessionId: string) {
    try {
      setSelectedSession(await invoke<AdminSessionDetail>({ action: 'admin_session_detail', session_id: sessionId }))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load session details.')
    }
  }

  function editChallenge(challenge?: AdminChallenge) {
    setChallengeEditor({
      id: challenge?.id ?? '',
      title: challenge?.title ?? '',
      challenge_type: challenge?.challenge_type ?? 'password',
      difficulty: challenge?.difficulty ?? 'easy',
      description: challenge?.description ?? '',
      question: challenge?.question ?? '',
      options: JSON.stringify(challenge?.options ?? [], null, 2),
      correct_answer: challenge?.correct_answer ?? '',
      hint: challenge?.hint ?? '',
      explanation: challenge?.explanation ?? '',
      points: String(challenge?.points ?? 100),
      is_active: String(challenge?.is_active ?? true),
    })
    setNotice('')
  }

  async function saveChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!challengeEditor) return
    let options: unknown
    try {
      options = JSON.parse(challengeEditor.options)
      if (!Array.isArray(options) || options.some((option) => typeof option !== 'string')) throw new Error()
    } catch {
      setNotice('Options must be a JSON array of strings, for example ["Choice A", "Choice B"].')
      return
    }
    setBusy(true)
    try {
      const { id, ...draft } = challengeEditor
      await invoke({ action: 'admin_save_challenge', challenge: {
        ...draft,
        ...(id ? { id } : {}),
        points: Number(challengeEditor.points),
        is_active: challengeEditor.is_active === 'true',
        options,
      } })
      setChallengeEditor(null)
      await loadAdminDashboard()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save challenge.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleChallenge(challenge: AdminChallenge) {
    try {
      await invoke({ action: 'admin_toggle_challenge', id: challenge.id, is_active: !challenge.is_active })
      await loadAdminDashboard()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update challenge.')
    }
  }

  async function deleteChallenge(challenge: AdminChallenge) {
    if (!window.confirm(`Delete "${challenge.title}"? Existing runs may prevent deletion.`)) return
    try {
      await invoke({ action: 'admin_delete_challenge', id: challenge.id })
      await loadAdminDashboard()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not delete challenge.')
    }
  }

  async function resetLeaderboard() {
    if (!window.confirm('Permanently remove every completed score and game session? This cannot be undone.')) return
    try {
      await invoke({ action: 'admin_reset_leaderboard' })
      await Promise.all([loadAdminDashboard(), loadLeaderboard()])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not reset leaderboard.')
    }
  }

  async function exportLeaderboard() {
    setBusy(true)
    setNotice('')
    try {
      const { entries } = await invoke<{ entries: Score[] }>({ action: 'admin_export_leaderboard' })
      const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
      const csv = [
        ['rank', 'player', 'total_points', 'correct_objectives', 'total_objectives', 'runs', 'completion_seconds', 'last_played'].join(','),
        ...entries.map((row) => [
          row.rank, row.player_name, row.total_score, row.correct_answers, row.total_questions, row.run_count ?? 1,
          row.completion_time, row.finished_at,
        ].map(escapeCsv).join(',')),
      ].join('\r\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'cyber-heist-leaderboard.csv'
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not export leaderboard.')
    } finally {
      setBusy(false)
    }
  }

  async function signOutAdmin() {
    if (supabase) await supabase.auth.signOut()
    setAdminReady(false)
    setAdminData(null)
  }

  function toggleSound() {
    setMuted((value) => {
      const nextMuted = !value
      setSoundMuted(nextMuted)
      if (!nextMuted) playGameSound('click', false)
      return nextMuted
    })
  }

  function visit(nextPage: Page) {
    setNotice('')
    setMobileMenuOpen(false)
    setPage(nextPage)
  }

  const filteredScores = [...scores].sort((a, b) => scoreFilter === 'fastest'
    ? a.completion_time - b.completion_time || b.total_score - a.total_score
    : b.total_score - a.total_score || b.correct_answers - a.correct_answers || a.completion_time - b.completion_time)

  return (
    <div className="app-shell">
      <div className="scanlines" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => visit('home')} aria-label="Cyber Heist home">
          <span className="brand-mark"><Command size={19} /></span>
          <span>CYBER<span className="brand-light">HEIST</span><small>CSIT // LIVE EVENT</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => visit('home')}>Home</button>
          <button className={page === 'leaderboard' ? 'nav-active' : ''} onClick={() => { visit('leaderboard'); void loadLeaderboard() }}>Leaderboard</button>
          <button onClick={openAdmin}>Admin <ExternalLink size={12} /></button>
        </nav>
        <div className="header-actions">
          <span className="live-tag"><i /> LIVE EVENT</span>
          <button className="sound-button" onClick={toggleSound} aria-label={muted ? 'Enable sound' : 'Mute sound'}>
            <AudioLines size={17} /> <span>{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
          </button>
          <button
            className="mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
            <button onClick={() => visit('home')}>Home</button>
            <button onClick={() => { visit('leaderboard'); void loadLeaderboard() }}>Leaderboard</button>
            <button onClick={() => void openAdmin()}>Admin</button>
          </nav>
        )}
      </header>

      <main>
        {!supabaseConfigured && page !== 'admin' && (
          <div className="setup-notice"><Wifi size={16} /><span><b>Backend setup required.</b> Configure Supabase to enable live games and shared scores.</span></div>
        )}

        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LandingPage
                scores={scores}
                participantCount={participantCount}
                leaderboardError={leaderboardError}
                todayLabel={todayLabel}
                onPlay={startRegistration}
                onLeaderboard={() => { visit('leaderboard'); void loadLeaderboard() }}
              />
            </motion.div>
          )}

          {page === 'lobby' && (
            <motion.section key="lobby" className="page centered-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button className="back-link" disabled={countdown !== null} onClick={() => visit('home')}><ArrowLeft size={15} /> BACK TO BASE</button>
              <div className="lobby-card panel">
                <p className="kicker">MISSION BRIEFING // 01</p><div className="lobby-emblem"><Crosshair size={30} /></div>
                <h1>Welcome, <span>{nickname}</span></h1><p className="lobby-intro">Your identity is ready. Set your difficulty, preview the local simulation, then begin your run.</p>
                <div className="difficulty-select"><label htmlFor="difficulty">DIFFICULTY</label><div className="select-wrap"><select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}><option value="easy">EASY // 100 PTS</option><option value="medium">MEDIUM // 200 PTS</option><option value="hard">HARD // 300 PTS</option></select><ChevronDown size={15} /></div></div>
                <button className="button button-outline simulation-preview-trigger" onClick={() => setSimulationPreviewOpen(true)} disabled={busy || countdown !== null}><Terminal size={15} /> PREVIEW SIMULATION <ArrowRight size={15} /></button>
                <div className="briefing-list"><div><Check size={15} /> Complete five randomly selected challenges</div><div><Check size={15} /> Hints cost 25 points per challenge</div><div><Check size={15} /> One run. One verified leaderboard score.</div></div>
                {notice && <p className="inline-notice" role="alert">{notice}</p>}
                <button className="button button-primary button-wide" disabled={busy || countdown !== null || !supabaseConfigured} onClick={() => void beginHeist()}>{busy ? 'CONNECTING TO NETWORK…' : countdown !== null ? 'ESTABLISHING UPLINK…' : 'START HEIST'} <ArrowRight size={17} /></button>
                {!supabaseConfigured && <p className="setup-inline">Connect a Supabase project to start a verified run.</p>}
                {countdown !== null && <div className="launch-countdown" role="status"><small>SECURE UPLINK ESTABLISHED</small><b>{countdown || 'GO'}</b><span>GET READY, {nickname.toUpperCase()}</span></div>}
              </div>
            </motion.section>
          )}

          {page === 'game' && session && currentChallenge && (
            <motion.section key="game" className="page game-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="game-topline"><div><span className="game-live"><i /> SIMULATION ACTIVE</span><span className="game-player"><span className="tiny-avatar">{nickname.slice(0, 1).toUpperCase()}</span>{nickname}</span></div><div className="game-top-actions"><span className={`timer ${secondsLeft < 90 ? 'timer-danger' : ''}`}><Clock3 size={16} /> {formatTime(secondsLeft)}</span><button className="end-button" onClick={() => setModal('exit')}>END RUN <X size={14} /></button></div></div>
              <div className="progress-info"><span>OBJECTIVE {String(questionIndex + 1).padStart(2, '0')} <span>/ 05</span></span><span>{session.challenges[questionIndex].difficulty.toUpperCase()} LEVEL <i /></span></div>
              <div className="progress-track"><span style={{ width: `${(questionIndex + (feedback && (feedback.is_correct || feedback.attempts_left === 0) ? 1 : 0)) / session.challenges.length * 100}%` }} /></div>
              <div className="game-layout">
                <aside className="game-sidebar panel"><p className="kicker">OPERATOR CONSOLE</p><div className="score-box"><small>CURRENT REPUTATION</small><b>{currentScore.toLocaleString()}</b><span>SIMULATION POINTS</span></div><div className="objective-list">{session.challenges.map((challenge, index) => <div className={`objective ${index === questionIndex ? 'objective-current' : index < questionIndex ? 'objective-done' : ''}`} key={challenge.id}><span>{index < questionIndex ? <Check size={13} /> : `0${index + 1}`}</span><div><b>{challenge.title}</b><small>{index < questionIndex ? 'COMPLETED' : index === questionIndex ? 'IN PROGRESS' : 'LOCKED'}</small></div></div>)}</div><div className="connection-status"><span><i /> ISOLATED TRAINING LAB</span><small>SIM {session.id.slice(0, 8).toUpperCase()}</small></div></aside>
                <article className="challenge-panel panel">
                  <div className="challenge-panel-top"><span className="challenge-type"><CurrentIcon size={16} /> {currentChallenge.challenge_type.replace('_', ' ').toUpperCase()}</span><span className="points-pill">+{currentChallenge.points} PTS</span></div>
                  <h1>{currentChallenge.title}</h1><p className="challenge-desc">{currentChallenge.description}</p>
                  <div className="sim-terminal" aria-label="Fictional cybersecurity training simulation">
                    <div className="sim-terminal-bar"><span><Terminal size={13} /> TRAINING NODE // 07</span><span className="sim-terminal-isolated"><i /> ISOLATED SANDBOX</span></div>
                    <div className="matrix-rain" aria-hidden="true">
                      {matrixStreams.map((stream, index) => (
                        <span
                          className="matrix-stream"
                          key={index}
                          style={{
                            left: stream.left,
                            animationDuration: stream.duration,
                            animationDelay: stream.delay,
                            opacity: stream.opacity,
                          }}
                        >
                          {stream.glyphs}
                        </span>
                      ))}
                    </div>
                    <div className="sim-terminal-lines" role="log" aria-live={typingLineId ? 'off' : 'polite'} aria-relevant="additions text">
                      {terminalLines.map((line) => <p className={`sim-line sim-line-${line.kind}${typingLineId === line.id ? ' sim-line-typing' : ''}`} key={line.id}>{line.text}</p>)}
                      <motion.div
                        className="hacker-operator"
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 0.72, scale: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      >
                        <svg viewBox="0 0 220 180" role="presentation">
                          <text className="hacker-code-rain hacker-code-left" x="20" y="30">01<tspan x="20" dy="10">10</tspan><tspan x="20" dy="10">11</tspan><tspan x="20" dy="10">01</tspan><tspan x="20" dy="10">00</tspan></text>
                          <text className="hacker-code-rain hacker-code-right" x="194" y="25">10<tspan x="194" dy="10">01</tspan><tspan x="194" dy="10">00</tspan><tspan x="194" dy="10">11</tspan><tspan x="194" dy="10">10</tspan></text>
                          <path className="hacker-hood" d="M110 12C77 12 60 39 63 77L48 111C31 125 23 146 19 171H201C197 146 189 125 172 111L157 77C160 39 143 12 110 12Z" />
                          <path className="hacker-face" d="M110 31C87 31 76 52 80 78L88 102H132L140 78C144 52 133 31 110 31Z" />
                          <path className="hacker-mask" d="M82 70L99 76L110 70L121 76L138 70L134 91L110 99L86 91Z" />
                          <path className="hacker-eyes" d="M91 64H103M117 64H129" />
                          <path className="hacker-arm hacker-arm-left" d="M55 113L82 105L102 130L87 143L57 133Z" />
                          <path className="hacker-arm hacker-arm-right" d="M165 113L138 105L118 130L133 143L163 133Z" />
                          <rect className="hacker-laptop-screen" x="54" y="122" width="112" height="32" rx="2" />
                          <path className="hacker-laptop-base" d="M45 155H175L188 166H32Z" />
                          <path className="hacker-keyboard" d="M72 159H148M81 163H139" />
                        </svg>
                        <span className="hacker-operator-tag"><i /> OPERATOR // ACTIVE</span>
                      </motion.div>
                      {busy && <p className="sim-line sim-line-system">[PROCESSING] Validating request inside the training simulation…</p>}
                      {authDemoProgress !== null && authDemoProgress < 100 && (
                        <div className="auth-demo-panel" aria-hidden="true">
                          <div className="auth-demo-heading"><span><i /> SANDBOX AUTH SIMULATION</span><b>LOCAL ONLY</b></div>
                          <div className="auth-demo-visual" aria-hidden="true">
                            <span className="auth-demo-core" />
                            <div className="auth-demo-bars">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((bar) => <i key={bar} style={{ animationDelay: `${bar * 45}ms` }} />)}</div>
                            <span className="auth-demo-readout">SYNTHETIC EVENTS // {Math.floor(authDemoProgress / 10).toString().padStart(2, '0')}%</span>
                          </div>
                          <div className="auth-demo-progress"><span style={{ width: `${authDemoProgress}%` }} /></div>
                          <p>No real passwords, accounts, or network requests are involved.</p>
                        </div>
                      )}
                      {levelCompletionProgress !== null && feedback && currentChallenge && (
                        <div className="level-completion-simulation" aria-hidden="true">
                          <div className="auth-demo-heading">
                            <span><i /> OBJECTIVE DEBRIEF // {completionSimulationLabels[currentChallenge.challenge_type] || 'TRAINING MODULE'}</span>
                            <b>LOCAL ONLY</b>
                          </div>
                          <div className={`level-simulation-visual level-simulation-${currentChallenge.challenge_type}`}>
                            {currentChallenge.challenge_type === 'password' && (
                              <div className="level-auth-visual">
                                <span className="level-auth-lock"><LockKeyhole size={15} /></span>
                                <div className="level-auth-flow"><i /></div>
                                <b>AUTH TOKEN // VERIFIED</b>
                              </div>
                            )}
                            {currentChallenge.challenge_type === 'code' && (
                              <div className="level-cipher-visual">
                                <div className="level-cipher-grid">{['4A', 'C2', '09', '7F', 'B1', '3D'].map((tile, index) => <span key={tile} style={{ animationDelay: `${index * 70}ms` }}>{tile}</span>)}</div>
                                <b>DECODE // LOCAL BUFFER</b>
                              </div>
                            )}
                            {currentChallenge.challenge_type === 'log_analysis' && (
                              <div className="level-log-visual">
                                <div className="level-log-lines">
                                  <span>[INFO] EVENT STREAM INDEXED</span>
                                  <span className="level-log-anomaly">[FLAG] ANOMALY CORRELATED</span>
                                  <span>[OK] TRAINING LOG VERIFIED</span>
                                </div>
                                <i className="level-log-scan" />
                              </div>
                            )}
                            {currentChallenge.challenge_type === 'security_breach' && (
                              <div className="level-defense-visual">
                                <span className="level-defense-orbit"><Shield size={16} /></span>
                                <b>DEFENSE RESPONSE // CONTAINED</b>
                              </div>
                            )}
                            {currentChallenge.challenge_type === 'digital_forensics' && (
                              <div className="level-forensic-visual">
                                <Fingerprint size={19} />
                                <div className="level-evidence-grid">{[0, 1, 2, 3, 4, 5].map((tile) => <i key={tile} />)}</div>
                                <b>EVIDENCE // CORRELATED</b>
                                <i className="level-forensic-scan" />
                              </div>
                            )}
                          </div>
                          <div className="level-simulation-readout">
                            <span className="auth-demo-readout">SYNTHETIC EVENTS // {String(levelCompletionProgress).padStart(3, '0')}%</span>
                          </div>
                          <div className="auth-demo-progress"><span style={{ width: `${levelCompletionProgress}%` }} /></div>
                          <p>{levelCompletionProgress === 100
                            ? feedback.is_correct ? 'Objective verified. Local debrief complete; no live system was accessed.' : 'Objective debrief complete. No live system was accessed.'
                            : 'Replaying a fictional event sequence inside the isolated training lab.'}</p>
                        </div>
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                    <form className="sim-command-form" onSubmit={(event) => void handleTerminalCommand(event)}>
                      <label htmlFor="simulation-command">operator@training-node:~$</label>
                      <input id="simulation-command" value={commandInput} onChange={(event) => setCommandInput(event.target.value)} disabled={busy || typingLineId !== null || (authDemoProgress !== null && authDemoProgress < 100) || (levelCompletionProgress !== null && levelCompletionProgress < 100)} placeholder={levelCompletionProgress !== null && levelCompletionProgress < 100 ? 'running objective simulation…' : simulationStage === 'debrief' ? 'type next to continue' : 'type help or scan'} autoComplete="off" spellCheck={false} aria-label="Simulation command" />
                      <button className="button button-primary" disabled={busy || typingLineId !== null || (authDemoProgress !== null && authDemoProgress < 100) || (levelCompletionProgress !== null && levelCompletionProgress < 100) || !commandInput.trim()}>{typingLineId ? 'ANALYZING…' : busy || (authDemoProgress !== null && authDemoProgress < 100) || (levelCompletionProgress !== null && levelCompletionProgress < 100) ? 'SIMULATING…' : 'RUN'} <ArrowRight size={14} /></button>
                    </form>
                    <div className="sim-terminal-footer"><span>SIMULATED COMMANDS ONLY</span><span>NO LIVE NETWORK ACCESS</span></div>
                  </div>
                  {notice && <p className="inline-notice" role="alert">{notice}</p>}
                </article>
              </div>
            </motion.section>
          )}

          {page === 'results' && (
            <motion.section key="results" className="page centered-page" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className={`results-card panel ${result?.new_personal_best ? 'new-best' : ''}`}><div className="results-icon"><Trophy size={27} /></div><p className="kicker">RUN COMPLETE // OPERATOR {nickname.toUpperCase()}</p><h1>Heist <span>debrief.</span></h1><p className="result-score">{result?.total_score.toLocaleString() ?? '0'} <small>PTS</small></p>{typeof result?.cumulative_score === 'number' && <p className="result-cumulative-score">USERNAME TOTAL // {result.cumulative_score.toLocaleString()} PTS</p>}<p className="result-sub">{result?.new_personal_best ? 'NEW PERSONAL BEST // SCORE VERIFIED BY THE GAME SERVER' : result?.rank ? `CURRENT RANK #${result.rank} // SCORE VERIFIED BY THE GAME SERVER` : 'RUN NOT RANKED // COMPLETE ALL OBJECTIVES TO APPEAR ON THE LEADERBOARD'}</p><div className="results-stats"><div><small>ACCURACY</small><b>{result?.accuracy ?? 0}%</b></div><div><small>OBJECTIVES</small><b>{result?.correct_answers ?? 0}<span> / 5</span></b></div><div><small>RANK</small><b>{result?.rank ? `#${result.rank}` : '—'}</b></div><div><small>TIME ELAPSED</small><b>{formatTime(result?.completion_time ?? elapsed)}</b></div></div><div className="results-buttons"><button className="button button-primary" onClick={() => { setSession(null); setResult(null); startRegistration() }}>PLAY AGAIN <ArrowRight size={16} /></button><button className="button button-outline" onClick={() => { visit('leaderboard'); void loadLeaderboard() }}>VIEW LEADERBOARD <Trophy size={15} /></button></div></div>
            </motion.section>
          )}

          {page === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LeaderboardPage
                scores={filteredScores}
                filter={scoreFilter}
                error={leaderboardError}
                onFilterChange={(filter) => { setScoreFilter(filter); void loadLeaderboard(filter) }}
                onRefresh={() => void loadLeaderboard()}
              />
            </motion.div>
          )}

          {page === 'admin' && (
            <motion.section key="admin" className="page admin-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!adminReady ? (
                <div className="admin-login panel">
                  <div className="admin-lock"><LockKeyhole size={22} /></div>
                  <p className="kicker">RESTRICTED ACCESS // ADMIN</p>
                  <h1>Command <span>center.</span></h1>
                  <p>Sign in with an authorized administrator account.</p>
                  <form onSubmit={(event) => void adminSignIn(event)}>
                    <label>Email<input type="email" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} /></label>
                    <label>Password<input type="password" required value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} /></label>
                    <button className="button button-primary button-wide" disabled={busy}>{busy ? 'AUTHENTICATING…' : 'AUTHENTICATE'} <ArrowRight size={15} /></button>
                  </form>
                  {notice && <p className="inline-notice" role="alert">{notice}</p>}
                  {!supabaseConfigured && <p className="setup-inline">Supabase environment variables are not configured.</p>}
                </div>
              ) : (
                <div className="admin-dashboard">
                  <div className="admin-heading">
                    <div><p className="kicker">SYSTEM OVERVIEW</p><h1>Command <span>center.</span></h1></div>
                    <div className="admin-head-actions">
                      <button className="button button-danger" onClick={() => void resetLeaderboard()}>RESET SCORES</button>
                      <button className="button button-outline" onClick={() => void signOutAdmin()}>SIGN OUT</button>
                    </div>
                  </div>
                  {notice && <p className="inline-notice" role="alert">{notice}</p>}
                  <div className="admin-stats">{[['TOTAL PLAYERS', adminData?.total_players], ['GAMES PLAYED', adminData?.games_played], ['AVERAGE SCORE', adminData?.average_score], ['HIGHEST SCORE', adminData?.highest_score]].map(([label, value]) => <div className="admin-stat panel" key={String(label)}><small>{label}</small><b>{value ?? '—'}</b></div>)}</div>
                  <div className="admin-lists">
                    <section className="panel">
                      <div className="admin-list-heading">
                        <h2>Recent sessions</h2>
                        <button className="text-link" disabled={busy} onClick={() => void exportLeaderboard()}>EXPORT CSV <ArrowDown size={13} /></button>
                      </div>
                      {adminData?.recent_games.map((row) => {
                        if (!row.session_id) return null
                        const sessionId = row.session_id
                        return <button className="admin-list-row admin-session-link" key={sessionId} onClick={() => void showSessionDetails(sessionId)}><b>{row.player_name}</b><span>{row.total_score.toLocaleString()} pts <ExternalLink size={12} /></span></button>
                      })}
                    </section>
                    <section className="panel">
                      <div className="admin-list-heading">
                        <h2>Challenge bank</h2>
                        <button className="text-link" onClick={() => editChallenge()}>ADD CHALLENGE <ArrowRight size={13} /></button>
                      </div>
                      <p className="admin-challenge-count"><span className="live-tag"><i /> {adminChallenges.filter((challenge) => challenge.is_active).length} ACTIVE</span></p>
                      {adminChallenges.map((challenge) => (
                        <div className="admin-list-row" key={challenge.id}>
                          <div><b>{challenge.title}</b><small className="admin-challenge-type">{challenge.challenge_type.replace('_', ' ')} // {challenge.difficulty.toUpperCase()}</small></div>
                          <div className="admin-challenge-actions">
                            <button onClick={() => editChallenge(challenge)}>EDIT</button>
                            <button onClick={() => void toggleChallenge(challenge)}>{challenge.is_active ? 'DEACTIVATE' : 'ACTIVATE'}</button>
                            <button onClick={() => void deleteChallenge(challenge)}>DELETE</button>
                          </div>
                        </div>
                      ))}
                    </section>
                  </div>
                  {challengeEditor && (
                    <div className="challenge-editor-backdrop">
                      <form className="challenge-editor panel" onSubmit={(event) => void saveChallenge(event)}>
                        <div className="admin-list-heading"><h2>{challengeEditor.id ? 'Edit challenge' : 'New challenge'}</h2><button type="button" className="text-link" onClick={() => setChallengeEditor(null)}>CLOSE <X size={14} /></button></div>
                        <div className="editor-grid">
                          <label>Title<input required maxLength={80} value={challengeEditor.title} onChange={(event) => setChallengeEditor({ ...challengeEditor, title: event.target.value })} /></label>
                          <label>Type<select value={challengeEditor.challenge_type} onChange={(event) => setChallengeEditor({ ...challengeEditor, challenge_type: event.target.value })}>{[['password', 'Password'], ['code', 'Code breaker'], ['log_analysis', 'Log analysis'], ['security_breach', 'Security breach'], ['digital_forensics', 'Digital forensics']].map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>
                          <label>Difficulty<select value={challengeEditor.difficulty} onChange={(event) => setChallengeEditor({ ...challengeEditor, difficulty: event.target.value })}>{['easy', 'medium', 'hard'].map((value) => <option key={value}>{value}</option>)}</select></label>
                          <label>Points<input type="number" min="1" max="1000" required value={challengeEditor.points} onChange={(event) => setChallengeEditor({ ...challengeEditor, points: event.target.value })} /></label>
                          <label className="editor-wide">Description<textarea required value={challengeEditor.description} onChange={(event) => setChallengeEditor({ ...challengeEditor, description: event.target.value })} /></label>
                          <label className="editor-wide">Question<textarea required value={challengeEditor.question} onChange={(event) => setChallengeEditor({ ...challengeEditor, question: event.target.value })} /></label>
                          <label className="editor-wide">Options (JSON string array)<textarea value={challengeEditor.options} onChange={(event) => setChallengeEditor({ ...challengeEditor, options: event.target.value })} /></label>
                          <label>Correct answer<input required value={challengeEditor.correct_answer} onChange={(event) => setChallengeEditor({ ...challengeEditor, correct_answer: event.target.value })} /></label>
                          <label>Hint<input required value={challengeEditor.hint} onChange={(event) => setChallengeEditor({ ...challengeEditor, hint: event.target.value })} /></label>
                          <label className="editor-wide">Explanation<textarea required value={challengeEditor.explanation} onChange={(event) => setChallengeEditor({ ...challengeEditor, explanation: event.target.value })} /></label>
                          <label className="editor-wide editor-checkbox"><input type="checkbox" checked={challengeEditor.is_active === 'true'} onChange={(event) => setChallengeEditor({ ...challengeEditor, is_active: String(event.target.checked) })} /> Active in challenge pool</label>
                        </div>
                        <button className="button button-primary button-wide" disabled={busy}>{busy ? 'SAVING…' : 'SAVE CHALLENGE'} <Check size={15} /></button>
                      </form>
                    </div>
                  )}
                  {selectedSession && (
                    <div className="challenge-editor-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSession(null) }}>
                      <section className="session-detail panel" role="dialog" aria-modal="true" aria-labelledby="session-detail-title">
                        <div className="admin-list-heading">
                          <div><p className="kicker">VERIFIED GAME SESSION</p><h2 id="session-detail-title">{selectedSession.session.player_name}</h2></div>
                          <button className="text-link" onClick={() => setSelectedSession(null)}>CLOSE <X size={14} /></button>
                        </div>
                        <div className="detail-stats">
                          <span><small>SCORE</small><b>{selectedSession.session.total_score.toLocaleString()}</b></span>
                          <span><small>ACCURACY</small><b>{Math.round(selectedSession.session.correct_answers / selectedSession.session.total_questions * 100)}%</b></span>
                          <span><small>TIME</small><b>{formatTime(selectedSession.session.completion_time)}</b></span>
                          <span><small>STATUS</small><b>{selectedSession.session.status.toUpperCase()}</b></span>
                        </div>
                        <div className="session-answer-list">
                          {selectedSession.answers.map((item, index) => (
                            <article className="session-answer" key={`${item.challenge_id}-${item.attempt_number}`}>
                              <div><small>ATTEMPT {index + 1} // {item.challenge_type.replace('_', ' ').toUpperCase()}</small><b>{item.challenge_title}</b></div>
                              <span className={item.is_correct ? 'answer-mark-correct' : 'answer-mark-wrong'}>{item.is_correct ? 'CORRECT' : 'INCORRECT'} · {item.points_earned} PTS</span>
                              <p>{item.submitted_answer}</p>
                            </article>
                          ))}
                          {selectedSession.answers.length === 0 && <div className="empty-table">No answers were recorded for this run.</div>}
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {simulationPreviewOpen && (
          <SimulationPreview difficulty={difficulty} onClose={() => setSimulationPreviewOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showRunDebrief && result && (
          <RunDebrief difficulty={difficulty} result={result} onComplete={closeRunDebrief} />
        )}
      </AnimatePresence>

      <footer className="site-footer"><span>© 2026 CYBER HEIST <i /> BUILT FOR CSIT</span><span>PLAY SMART. STAY ETHICAL. <Shield size={13} /></span><button onClick={openAdmin}>ADMIN ACCESS</button></footer>

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
            <motion.div className="modal-card panel" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
              <button className="modal-close" onClick={() => setModal(null)} aria-label="Close dialog"><X size={19} /></button>
              {modal === 'register' ? <><div className="modal-icon"><Fingerprint size={23} /></div><p className="kicker">CREATE YOUR OPERATOR ID</p><h2>Choose your <span>callsign.</span></h2><p className="modal-copy">No account needed. Your nickname appears on the public leaderboard.</p><form onSubmit={submitRegistration}><label htmlFor="nickname">OPERATOR NICKNAME</label><input id="nickname" autoFocus maxLength={16} value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="e.g. ghost_protocol" autoComplete="off" /><small>3–16 characters · letters, numbers, _ or -</small>{notice && <p className="inline-notice" role="alert">{notice}</p>}<button className="button button-primary button-wide" disabled={busy}>{busy ? 'CHECKING…' : 'CONTINUE'} <ArrowRight size={16} /></button></form></> : <><div className="modal-icon modal-warning"><ShieldAlert size={23} /></div><p className="kicker">MISSION CONTROL // ALERT</p><h2>Abort this <span>run?</span></h2><p className="modal-copy">Your progress will be submitted as an incomplete session and cannot be resumed.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setModal(null)}>KEEP PLAYING</button><button className="button button-danger" disabled={busy} onClick={() => void finishGame()}>END RUN</button></div></>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
