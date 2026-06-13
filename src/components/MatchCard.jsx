import './MatchCard.css'

const STATUS_MAP = {
  STATUS_SCHEDULED:   { label: 'Soon',    cls: 'soon'  },
  STATUS_IN_PROGRESS: { label: 'LIVE',    cls: 'live'  },
  STATUS_FINAL:       { label: 'FT',      cls: 'final' },
  STATUS_HALFTIME:    { label: 'HT',      cls: 'live'  },
}

export default function MatchCard({ match, kalshiOdds = null, featured = false }) {
  if (!match) return null

  const status = STATUS_MAP[match.status] ?? { label: '—', cls: 'soon' }
  const isLive = match.status === 'STATUS_IN_PROGRESS'
  const isFinal = match.status === 'STATUS_FINAL'
  const kickoff = new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`match-card ${featured ? 'featured' : ''}`}>
      {featured && <div className="match-card-label section-label">Game of the Day</div>}

      <div className="match-card-status-row">
        <span className={`match-status pill pill-${status.cls === 'live' ? 'green' : status.cls === 'final' ? 'blue' : 'gold'}`}>
          {isLive && <span className="live-dot" />}
          {isLive && match.displayClock ? match.displayClock : status.label}
        </span>
        {match.notes && <span className="match-notes dimmed">{match.notes}</span>}
        {!isLive && !isFinal && <span className="match-kickoff muted">{kickoff}</span>}
      </div>

      <div className="match-teams">
        <TeamSide team={match.home} isHome score={isLive || isFinal ? match.home.score : null} />
        <div className="match-vs">
          {(isLive || isFinal)
            ? <span className="match-score">{match.home.score ?? 0} – {match.away.score ?? 0}</span>
            : <span className="match-vs-text muted">vs</span>
          }
        </div>
        <TeamSide team={match.away} score={isLive || isFinal ? match.away.score : null} />
      </div>

      {kalshiOdds && (
        <div className="match-odds">
          <OddsBar home={kalshiOdds.home} draw={kalshiOdds.draw} away={kalshiOdds.away} />
        </div>
      )}

      {match.venue && (
        <div className="match-venue dimmed">
          📍 {match.venue}{match.venueCity ? `, ${match.venueCity}` : ''}
          {match.broadcast && <span> · {match.broadcast}</span>}
        </div>
      )}
    </div>
  )
}

function TeamSide({ team, score, isHome }) {
  return (
    <div className={`team-side ${isHome ? 'home' : 'away'}`}>
      {team?.logo && <img className="team-logo" src={team.logo} alt={team.abbr} />}
      <div className="team-info">
        <span className="team-name">{team?.name ?? '—'}</span>
        {team?.record && <span className="team-record dimmed">{team.record}</span>}
      </div>
    </div>
  )
}

function OddsBar({ home, draw, away }) {
  const total = (home ?? 0) + (draw ?? 0) + (away ?? 0)
  if (!total) return null
  const hp = ((home / total) * 100).toFixed(0)
  const dp = ((draw / total) * 100).toFixed(0)
  const ap = ((away / total) * 100).toFixed(0)

  return (
    <div className="odds-bar-wrap">
      <div className="odds-bar">
        <div className="odds-seg home-seg" style={{ width: `${hp}%` }} />
        {draw > 0 && <div className="odds-seg draw-seg" style={{ width: `${dp}%` }} />}
        <div className="odds-seg away-seg" style={{ width: `${ap}%` }} />
      </div>
      <div className="odds-labels">
        <span className="accent mono">{hp}%</span>
        {draw > 0 && <span className="muted mono">{dp}%</span>}
        <span className="blue-text mono">{ap}%</span>
      </div>
    </div>
  )
}
