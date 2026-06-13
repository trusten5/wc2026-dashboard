import { useKalshi } from '../hooks/useKalshi'
import { toPercent } from '../api/kalshi'
import './TrophyRace.css'

export default function TrophyRace() {
  const { winnerMarkets, marketsLoading } = useKalshi()

  // Use best available price: ask if bid is 0
  const withPrice = winnerMarkets.map(m => ({
    ...m,
    _prob: parseFloat(m.yes_bid_dollars) > 0
      ? parseFloat(m.yes_bid_dollars)
      : parseFloat(m.yes_ask_dollars ?? '0'),
  })).sort((a, b) => b._prob - a._prob)

  const maxProb = withPrice[0]?._prob ?? 1

  return (
    <div className="trophy-layout">
      <div className="screen-header">
        <h1 className="screen-title">Trophy Race</h1>
        <p className="screen-sub muted">Win probabilities · Kalshi prediction market</p>
      </div>

      {marketsLoading
        ? <div className="spinner" />
        : withPrice.length === 0
          ? <div className="empty">No winner markets found on Kalshi</div>
          : (
            <div className="trophy-list">
              {withPrice.map((m, i) => (
                <TrophyRow key={m.ticker} market={m} rank={i + 1} maxProb={maxProb} />
              ))}
            </div>
          )
      }
    </div>
  )
}

function TrophyRow({ market, rank, maxProb }) {
  const prob = market._prob
  const barW = maxProb > 0 ? (prob / maxProb) * 100 : 0
  const vol  = parseFloat(market.volume_fp ?? '0')
  const name = market.yes_sub_title || market.title

  return (
    <div className="trophy-row card">
      <span className="trophy-rank mono dimmed">{rank}</span>
      <div className="trophy-info">
        <span className="trophy-name">{name}</span>
        <div className="trophy-bar-wrap">
          <div className="trophy-bar">
            <div className="trophy-bar-fill" style={{ width: `${barW}%` }} />
          </div>
        </div>
      </div>
      <div className="trophy-right">
        <span className="trophy-pct accent mono">{toPercent(prob)}</span>
        {vol > 0 && (
          <span className="trophy-vol dimmed mono">${vol.toLocaleString()}</span>
        )}
      </div>
    </div>
  )
}