import { useMemo } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useKalshi } from '../hooks/useKalshi'
import { getScoreboard, getStandings, parseMatches, parseStandings } from '../api/espn'
import { getBiggestMovers, toPercent } from '../api/kalshi'
import MatchCard from '../components/MatchCard'
import './Today.css'

// Game of the day = highest volume WINNER market (KXMENWORLDCUP series)
function getMatchOfTheDay(winnerMarkets) {
  return [...winnerMarkets].sort((a, b) =>
    parseFloat(b.volume_fp ?? '0') - parseFloat(a.volume_fp ?? '0')
  )[0] ?? null
}

export default function Today() {
  const { markets, winnerMarkets, marketsLoading } = useKalshi()

  const { data: scoreboard, loading: sbLoading } = useFetch(
    () => getScoreboard(), [], 60_000
  )
  const { data: standings, loading: stLoading } = useFetch(
    () => getStandings(), [], 300_000
  )

  const matches = useMemo(() => parseMatches(scoreboard), [scoreboard])
  const groups  = useMemo(() => parseStandings(standings), [standings])
  const gotd    = useMemo(() => getMatchOfTheDay(winnerMarkets), [winnerMarkets])
  const movers  = useMemo(() => getBiggestMovers(markets, 6), [markets])

  const teamName = gotd?.yes_sub_title ?? gotd?.title ?? '—'
  const gotdProb = gotd
    ? (parseFloat(gotd.yes_bid_dollars) > 0
        ? parseFloat(gotd.yes_bid_dollars)
        : parseFloat(gotd.yes_ask_dollars ?? '0'))
    : 0
  const gotdVol = gotd ? parseFloat(gotd.volume_fp ?? '0') : 0

  return (
    <div className="today-layout">

      {/* Top row: GOTD + Movers */}
      <div className="today-top">

        <section className="gotd-section">
          <div className="section-label">Hottest Market · Kalshi</div>
          {marketsLoading
            ? <div className="spinner" />
            : gotd
              ? (
                <div className="gotd-card card">
                  <div className="gotd-team">{teamName}</div>
                  <div className="gotd-subtitle muted">to win the 2026 World Cup</div>
                  <div className="gotd-meta">
                    <span className="pill pill-green mono">
                      {toPercent(gotdProb)} chance
                    </span>
                    <span className="pill pill-blue mono">
                      ${gotdVol.toLocaleString(undefined, { maximumFractionDigits: 0 })} volume
                    </span>
                  </div>
                </div>
              )
              : <div className="empty">No Kalshi WC markets found</div>
          }
        </section>

        <section className="movers-section">
          <div className="section-label">Biggest Movers · Today</div>
          {marketsLoading
            ? <div className="spinner" />
            : movers.length === 0
              ? <div className="empty">No movement yet today</div>
              : (
                <div className="movers-list card">
                  {movers.map((m, i) => {
                    const short = m.title
                    return (
                      <div key={m.ticker} className="mover-row">
                        <span className="mover-rank dimmed mono">{i + 1}</span>
                        <span className="mover-title">{short}</span>
                        <span className={`mover-move pill ${m.move >= 0 ? 'pill-green' : 'pill-red'}`}>
                          {m.move >= 0 ? '▲' : '▼'} {Math.abs(m.move * 100).toFixed(1)}¢
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
          }
        </section>

      </div>

      {/* Today's Matches */}
      <section>
        <div className="section-label">
          Today's Matches
          {sbLoading && <span className="loading-dot" />}
        </div>
        {sbLoading
          ? <div className="spinner" />
          : matches.length === 0
            ? <div className="empty">No matches today — check back soon</div>
            : (
              <div className="matches-list">
                {matches.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )
        }
      </section>

      {/* All Group Standings */}
      <section>
        <div className="section-label">Group Standings</div>
        {stLoading
          ? <div className="spinner" />
          : groups.length === 0
            ? <div className="empty">Standings not yet available</div>
            : (
              <div className="groups-grid">
                {groups.map(g => (
                  <GroupTable key={g.abbr ?? g.name} group={g} />
                ))}
              </div>
            )
        }
      </section>

    </div>
  )
}

function GroupTable({ group }) {
  return (
    <div className="group-table card">
      <div className="group-header">
        <span className="group-name accent mono">Group {group.abbr}</span>
        <div className="group-cols dimmed mono">MP W D L Pts</div>
      </div>
      {group.entries.map(e => (
        <div key={e.team.id} className="group-row">
          {e.team.logo && <img className="group-logo" src={e.team.logo} alt={e.team.abbr} />}
          <span className="group-team-name">{e.team.name}</span>
          <div className="group-stats mono">
            <span>{e.stats.gamesPlayed ?? 0}</span>
            <span>{e.stats.wins ?? 0}</span>
            <span>{e.stats.ties ?? 0}</span>
            <span>{e.stats.losses ?? 0}</span>
            <span className="accent">{e.stats.points ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  )
}