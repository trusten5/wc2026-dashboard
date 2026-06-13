import { useState, useMemo } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getSchedule, parseMatches } from '../api/espn'
import MatchCard from '../components/MatchCard'
import './Bracket.css'

// WC 2026: June 11 – July 19
const DATE_RANGE = '20260611-20260719'

export default function Bracket() {
  const { data: schedule, loading } = useFetch(
    () => getSchedule(DATE_RANGE), [], 300_000
  )

  const allMatches = useMemo(() => parseMatches(schedule), [schedule])

  // Group by date
  const byDate = useMemo(() => {
    const map = {}
    allMatches.forEach(m => {
      const day = m.date?.slice(0, 10)
      if (!map[day]) map[day] = []
      map[day].push(m)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [allMatches])

  const [activeDate, setActiveDate] = useState(null)
  const today = new Date().toISOString().slice(0, 10)
  const displayed = activeDate ?? today

  const dayMatches = byDate.find(([d]) => d === displayed)?.[1] ?? []

  return (
    <div className="bracket-layout">
      <div className="screen-header">
        <h1 className="screen-title">Schedule</h1>
        <p className="screen-sub muted">104 matches · June 11 – July 19</p>
      </div>

      {/* Date picker */}
      <div className="date-strip">
        {byDate.map(([date, matches]) => {
          const d = new Date(date + 'T12:00:00')
          const isToday = date === today
          const isActive = date === displayed
          return (
            <button
              key={date}
              className={`date-btn ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => setActiveDate(date)}
            >
              <span className="date-btn-day">{d.toLocaleDateString([], { weekday: 'short' })}</span>
              <span className="date-btn-num">{d.getDate()}</span>
              <span className="date-btn-count">{matches.length}</span>
            </button>
          )
        })}
      </div>

      {/* Matches for selected date */}
      <div className="bracket-matches">
        {loading
          ? <div className="spinner" />
          : dayMatches.length === 0
            ? <div className="empty">No matches on this date</div>
            : dayMatches.map(m => <MatchCard key={m.id} match={m} />)
        }
      </div>
    </div>
  )
}
