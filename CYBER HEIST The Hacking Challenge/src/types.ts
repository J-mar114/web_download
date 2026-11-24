export type Difficulty = 'easy' | 'medium' | 'hard'
export type Page = 'home' | 'lobby' | 'game' | 'results' | 'leaderboard' | 'admin'
export type LeaderboardFilter = 'all' | 'today' | 'fastest'

export type Challenge = {
  id: string
  title: string
  challenge_type: string
  difficulty: Difficulty
  description: string
  question: string
  options: string[] | null
  points: number
}

export type AdminChallenge = Challenge & {
  correct_answer: string
  hint: string
  explanation: string
  is_active: boolean
}

export type Score = {
  rank: number
  session_id?: string
  player_name: string
  total_score: number
  correct_answers: number
  total_questions: number
  completion_time: number
  finished_at: string
  run_count?: number
}

export type Session = { id: string; token: string; challenges: Challenge[] }
export type Feedback = { is_correct: boolean; explanation: string; points_earned: number; attempts_left: number }
export type Result = {
  total_score: number
  correct_answers: number
  incorrect_answers: number
  total_questions: number
  completion_time: number
  accuracy: number
  rank: number | null
  new_personal_best: boolean
  cumulative_score?: number
}

export type AdminSessionDetail = {
  session: {
    id: string
    player_name: string
    total_score: number
    correct_answers: number
    incorrect_answers: number
    total_questions: number
    completion_time: number
    status: string
    started_at: string
    finished_at: string | null
  }
  answers: Array<{
    challenge_id: string
    challenge_title: string
    challenge_type: string
    submitted_answer: string
    is_correct: boolean
    points_earned: number
    attempt_number: number
    answered_at: string
  }>
}
