// Kalshi public + authenticated API
// Public endpoints need no key. Trading endpoints need your API key stored in localStorage.

const KALSHI_BASE = '/kalshi-api'

// ── Auth ────────────────────────────────────────────────────

export function getStoredKey() {
  return localStorage.getItem('kalshi_api_key') || null
}

export function setStoredKey(key) {
  localStorage.setItem('kalshi_api_key', key)
}

export function clearStoredKey() {
  localStorage.removeItem('kalshi_api_key')
}

function authHeaders() {
  const key = getStoredKey()
  if (!key) return {}
  return { 'KALSHI-ACCESS-KEY': key }
}

async function get(path, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) Object.assign(headers, authHeaders())
  const res = await fetch(KALSHI_BASE + path, { headers })
  if (!res.ok) throw new Error(`Kalshi ${res.status}: ${path}`)
  return res.json()
}

async function post(path, body) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders() }
  const res = await fetch(KALSHI_BASE + path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Kalshi ${res.status}: ${path}`)
  return res.json()
}

// ── Known WC 2026 series tickers ────────────────────────────
// Discovered from kalshi.com/markets URLs
export const WC_SERIES = {
  winner:      'KXMENWORLDCUP',    // "Will X win the World Cup?" — one market per team
  groupWin:    'KXWCGROUPWIN',     // "Will X win Group Y?"
  groupQual:   'KXWCGROUPQUAL',    // "Will X qualify from Group Y?"
  groupOrder:  'KXWCGROUPORDER',   // "Exact finishing order of Group X"
  teamGoals:   'KXWCTEAMGOALS',    // "Will X score 3+ goals in group stage?"
  gsGoals:     'KXWCGSGOALS',      // "Which team scores most/fewest goals in group stage?"
  goalEveryGame: 'KXWCGOALEVERYGAME', // "Will any player score in every group game?"
}

// Fetch markets for a specific WC series
export async function getMarketsBySeries(seriesTicker, limit = 200) {
  const params = new URLSearchParams({ series_ticker: seriesTicker, limit, status: 'open' })
  const data = await get(`/markets?${params}`)
  return data.markets ?? []
}

// Fetch all WC markets sequentially to avoid 429 rate limits
export async function getWCMarkets() {
  const results = []
  for (const ticker of Object.values(WC_SERIES)) {
    try {
      const markets = await getMarketsBySeries(ticker)
      results.push(...markets)
      await new Promise(r => setTimeout(r, 600))
    } catch (e) {
      console.warn(`Failed to fetch ${ticker}:`, e.message)
    }
  }
  return results
}

// Get a single market by ticker
export async function getMarket(ticker) {
  const data = await get(`/markets/${ticker}`)
  return data.market
}

// Get orderbook for a market
export async function getOrderbook(ticker) {
  const data = await get(`/markets/${ticker}/orderbook`)
  return data.orderbook_fp
}

// Get recent trades across all markets (no auth)
export async function getRecentTrades(ticker = null, limit = 100) {
  const params = new URLSearchParams({ limit })
  if (ticker) params.set('ticker', ticker)
  const data = await get(`/markets/trades?${params}`)
  return data.trades ?? []
}

// Get all series — useful for discovering WC series tickers
export async function getSeries() {
  const data = await get('/series')
  return data.series ?? []
}

// Get events (groups of related markets)
export async function getEvents(seriesTicker = null) {
  const params = new URLSearchParams({ limit: 200 })
  if (seriesTicker) params.set('series_ticker', seriesTicker)
  const data = await get(`/events?${params}`)
  return data.events ?? []
}

// ── Authenticated endpoints (require API key) ────────────────

export async function getPortfolio() {
  return get('/portfolio/positions', true)
}

export async function getBalance() {
  return get('/portfolio/balance', true)
}

export async function getMyTrades() {
  return get('/portfolio/trades?limit=50', true)
}

export async function placeOrder({ ticker, side, count, type = 'limit', price }) {
  return post('/portfolio/orders', {
    ticker,
    side,       // 'yes' | 'no'
    count,      // number of contracts
    type,       // 'limit' | 'market'
    yes_price: side === 'yes' ? price : undefined,
    no_price: side === 'no' ? price : undefined,
  })
}

// ── Helpers ──────────────────────────────────────────────────

// Convert Kalshi price (0–1 float or cents) to percentage string
export function toPercent(price) {
  if (price == null) return '—'
  const p = parseFloat(price)
  if (isNaN(p) || p === 0) return '—'
  // Kalshi returns dollar strings like "0.1700" (already 0-1 range)
  return `${(p * 100).toFixed(1)}%`
}

// Price as dollars (Kalshi prices are in dollars 0.00–1.00)
export function toDollars(price) {
  if (price == null) return '—'
  return `$${parseFloat(price).toFixed(2)}`
}

// Sort markets by volume descending
export function sortByVolume(markets) {
  return [...markets].sort((a, b) => {
    const va = parseFloat(a.volume_fp ?? '0')
    const vb = parseFloat(b.volume_fp ?? '0')
    return vb - va
  })
}

// Find the single highest-volume WC match market (Game of the Day)
export function getGameOfTheDay(markets) {
  // Prefer non-winner, non-group markets (i.e. match-level or prop markets)
  const matchMarkets = markets.filter(m => {
    const ticker = (m.ticker ?? '').toUpperCase()
    return !ticker.startsWith('KXMENWORLDCUP') && !ticker.startsWith('KXWCGROUP')
  })
  const pool = matchMarkets.length > 0 ? matchMarkets : markets
  return sortByVolume(pool)[0] ?? null
}

// Compute movers: markets whose yes_price shifted most from open
export function getBiggestMovers(markets, n = 5) {
  return markets
    .map(m => {
      const current = parseFloat(m.yes_bid_dollars ?? m.yes_ask_dollars ?? '0')
      const prev = parseFloat(m.previous_yes_bid_dollars ?? m.previous_yes_ask_dollars ?? '0')
      return { ...m, move: current - prev }
    })
    .filter(m => m.move !== 0)
    .sort((a, b) => Math.abs(b.move) - Math.abs(a.move))
    .slice(0, n)
}