// ESPN undocumented public API — no auth required
const ESPN_BASE = '/espn-api/apis/site/v2/sports/soccer/fifa.world'

async function get(path) {
  const res = await fetch(ESPN_BASE + path)
  if (!res.ok) throw new Error(`ESPN ${res.status}: ${path}`)
  return res.json()
}

// Today's scoreboard (live scores, match status)
export async function getScoreboard(dateStr = null) {
  const q = dateStr ? `?dates=${dateStr}` : ''
  return get(`/scoreboard${q}`)
}

// Full standings / group table
export async function getStandings() {
  const res = await fetch('/espn-api/apis/v2/sports/soccer/fifa.world/standings')
  if (!res.ok) throw new Error(`ESPN ${res.status}: standings`)
  return res.json()
}

// All matches for a date range (YYYYMMDD-YYYYMMDD)
export async function getSchedule(dateRange) {
  return get(`/scoreboard?limit=200&dates=${dateRange}`)
}

// Single match detail — box score, stats, lineups
export async function getMatchDetail(matchId) {
  return get(`/summary?event=${matchId}`)
}

// Top scorers / stats leaders
export async function getStatLeaders() {
  // ESPN leaders endpoint for soccer
  const res = await fetch('/espn-api/apis/site/v2/sports/soccer/fifa.world/leaders')
  if (!res.ok) return null
  return res.json()
}

// ── Helpers ────────────────────────────────────────────────

// Parse today's matches from scoreboard response
export function parseMatches(scoreboard) {
  return (scoreboard?.events ?? []).map(event => {
    const comp = event.competitions?.[0]
    const home = comp?.competitors?.find(c => c.homeAway === 'home')
    const away = comp?.competitors?.find(c => c.homeAway === 'away')
    return {
      id: event.id,
      name: event.name,
      shortName: event.shortName,
      date: event.date,
      status: comp?.status?.type?.name,          // 'STATUS_SCHEDULED' | 'STATUS_IN_PROGRESS' | 'STATUS_FINAL'
      displayClock: comp?.status?.displayClock,
      period: comp?.status?.period,
      home: {
        id: home?.team?.id,
        name: home?.team?.displayName,
        abbr: home?.team?.abbreviation,
        logo: home?.team?.logo,
        score: home?.score,
        record: home?.records?.[0]?.summary,
      },
      away: {
        id: away?.team?.id,
        name: away?.team?.displayName,
        abbr: away?.team?.abbreviation,
        logo: away?.team?.logo,
        score: away?.score,
        record: away?.records?.[0]?.summary,
      },
      venue: comp?.venue?.fullName,
      venueCity: comp?.venue?.address?.city,
      broadcast: comp?.broadcasts?.[0]?.names?.[0],
      group: event.season?.slug,
      notes: comp?.notes?.[0]?.headline,
    }
  })
}

// Format date as YYYYMMDD for ESPN
export function toESPNDate(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

// Parse group standings from standings response
export function parseStandings(standings) {
  const groups = standings?.children ?? []
  return groups.map(group => ({
    name: group.name,
    abbr: group.abbreviation,
    entries: (group.standings?.entries ?? []).map(entry => ({
      team: {
        id: entry.team?.id,
        name: entry.team?.displayName,
        abbr: entry.team?.abbreviation,
        logo: entry.team?.logos?.[0]?.href,
      },
      stats: Object.fromEntries(
        (entry.stats ?? []).map(s => [s.name, s.value])
      ),
    }))
  }))
}
