import { useFetch } from '../hooks/useFetch'
import { getStatLeaders } from '../api/espn'
import './Stats.css'

export default function Stats() {
  const { data, loading } = useFetch(() => getStatLeaders(), [], 300_000)

  const categories = data?.leaders ?? []

  return (
    <div className="stats-layout">
      <div className="screen-header">
        <h1 className="screen-title">Player Stats</h1>
        <p className="screen-sub muted">Updated after each match</p>
      </div>

      {loading
        ? <div className="spinner" />
        : categories.length === 0
          ? <StatsUnavailable />
          : (
            <div className="stats-grid">
              {categories.map(cat => (
                <StatTable key={cat.name} category={cat} />
              ))}
            </div>
          )
      }
    </div>
  )
}

function StatTable({ category }) {
  const leaders = category.leaders ?? []
  return (
    <div className="stat-table card">
      <div className="stat-table-header">
        <span className="section-label" style={{ marginBottom: 0 }}>{category.displayName}</span>
      </div>
      {leaders.slice(0, 10).map((entry, i) => (
        <div key={i} className="stat-row">
          <span className="stat-rank dimmed mono">{i + 1}</span>
          {entry.athlete?.flag?.href && (
            <img className="stat-flag" src={entry.athlete.flag.href} alt="" />
          )}
          {entry.athlete?.headshot?.href
            ? <img className="stat-headshot" src={entry.athlete.headshot.href} alt={entry.athlete.displayName} />
            : <div className="stat-headshot-placeholder" />
          }
          <div className="stat-player">
            <span className="stat-name">{entry.athlete?.displayName ?? '—'}</span>
            <span className="stat-team dimmed">{entry.team?.displayName ?? ''}</span>
          </div>
          <span className="stat-value accent mono">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function StatsUnavailable() {
  return (
    <div className="stats-unavailable">
      <div className="empty">
        <p>Player stats will appear once matches are underway.</p>
        <p style={{ marginTop: 8 }}>Check back after the first group stage games.</p>
      </div>
    </div>
  )
}
