import { Radio, Shield, Trophy } from 'lucide-react'
import type { LeaderboardFilter, Score } from '../types'
import { formatTime } from '../lib/game'

type Props = {
  scores: Score[]
  filter: LeaderboardFilter
  error: string
  onFilterChange: (filter: LeaderboardFilter) => void
  onRefresh: () => void
}

export default function LeaderboardPage({ scores, filter, error, onFilterChange, onRefresh }: Props) {
  return (
    <section className="page leaderboard-page">
      <div className="leaderboard-heading">
        <div><p className="kicker">LIVE RANKINGS // VERIFIED SCORES</p><h1>Global <span>leaderboard.</span></h1><p>Points add up across runs with the same username. Fastest Run shows each username's best single run.</p></div>
        <button className="refresh-button" onClick={onRefresh}><Radio size={15} /> LIVE <span>↻</span></button>
      </div>
      <div className="filter-tabs">
        {(['all', 'today', 'fastest'] as const).map((value) => (
          <button key={value} className={filter === value ? 'filter-active' : ''} onClick={() => onFilterChange(value)}>
            {value === 'all' ? 'ALL TIME' : value === 'today' ? 'TODAY' : 'FASTEST RUN'}
          </button>
        ))}
      </div>
      {scores.length > 0 && (
        <div className="podium">
          {[scores[1], scores[0], scores[2]].filter((entry): entry is Score => entry !== undefined).map((entry) => (
            <div className={`podium-card podium-${entry.rank}`} key={`podium-${entry.rank}-${entry.player_name}`}>
              <span>RANK #{String(entry.rank).padStart(2, '0')}</span>
              <b>{entry.player_name}</b>
              <strong>{entry.total_score.toLocaleString()} <small>PTS</small></strong>
              <small>{filter === 'fastest' ? 'BEST RUN' : 'TOTAL TIME'} {formatTime(entry.completion_time)} // {entry.correct_answers}/{entry.total_questions} OBJECTIVES // {entry.run_count ?? 1} RUNS</small>
            </div>
          ))}
        </div>
      )}
      <div className="leaderboard-table panel">
        <div className="table-header"><span>RANK</span><span>OPERATOR</span><span>OBJECTIVES</span><span>{filter === 'fastest' ? 'RUN TIME' : 'TOTAL TIME'}</span><span>{filter === 'fastest' ? 'DATE' : 'LAST PLAYED'}</span><span>SCORE</span></div>
        {scores.slice(0, 10).map((entry, index) => (
          <div className="leader-row" key={`${entry.rank}-${entry.player_name}-${entry.finished_at}`}>
            <span className={`rank rank-${index + 1}`}>{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
            <span className="leader-name"><span className="operator-avatar">{entry.player_name.slice(0, 1).toUpperCase()}</span><b>{entry.player_name}</b></span>
            <span>{entry.correct_answers}/{entry.total_questions} <small>({Math.round(entry.correct_answers / entry.total_questions * 100)}%) · {entry.run_count ?? 1} RUNS</small></span>
            <span>{formatTime(entry.completion_time)}</span>
            <span>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(entry.finished_at))}</span>
            <strong>{entry.total_score.toLocaleString()} <small>PTS</small></strong>
          </div>
        ))}
        {scores.length === 0 && <div className="empty-table"><Trophy size={21} /><span>{error || 'No verified scores in this ranking yet.'}</span></div>}
      </div>
      <p className="leaderboard-foot"><Shield size={14} /> RANKINGS UPDATE AUTOMATICALLY WHEN A RUN IS VERIFIED.</p>
    </section>
  )
}
