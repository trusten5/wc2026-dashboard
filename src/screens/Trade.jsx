import { useState } from 'react'
import { useKalshi } from '../hooks/useKalshi'
import { useFetch } from '../hooks/useFetch'
import { getPortfolio, getBalance, getMyTrades, placeOrder, toPercent, toDollars } from '../api/kalshi'
import './Trade.css'

export default function Trade() {
  const { apiKey, saveKey, hasKey, markets } = useKalshi()

  if (!hasKey) return <ConnectKalshi onConnect={saveKey} />

  return (
    <div className="trade-layout">
      <div className="screen-header">
        <h1 className="screen-title">Trade</h1>
        <p className="screen-sub muted">Your Kalshi WC positions</p>
      </div>
      <div className="trade-grid">
        <BalanceCard />
        <PositionsCard />
        <TradeHistoryCard />
        <MarketBrowser markets={markets} />
      </div>
    </div>
  )
}

function ConnectKalshi({ onConnect }) {
  const [key, setKey] = useState('')
  return (
    <div className="connect-wrap">
      <div className="connect-card card">
        <div className="connect-icon">💹</div>
        <h2 className="connect-title">Connect Kalshi</h2>
        <p className="connect-desc muted">
          Enter your Kalshi API key to view positions and place trades.
          Your key is stored locally in this browser only — never sent anywhere except Kalshi's API.
        </p>
        <div className="connect-steps">
          <p className="dimmed mono" style={{ fontSize: 11 }}>
            1. Go to kalshi.com → Account → API Keys<br />
            2. Create a new key and copy it<br />
            3. Paste it below
          </p>
        </div>
        <input
          className="key-input"
          type="password"
          placeholder="Paste your Kalshi API key..."
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <button
          className="connect-btn"
          disabled={!key.trim()}
          onClick={() => onConnect(key.trim())}
        >
          Connect
        </button>
      </div>
    </div>
  )
}

function BalanceCard() {
  const { data, loading } = useFetch(() => getBalance(), [], 30_000)
  return (
    <div className="card balance-card">
      <div className="section-label">Balance</div>
      {loading
        ? <div className="spinner" />
        : (
          <div className="balance-amount accent mono">
            {toDollars(data?.balance ?? 0)}
          </div>
        )
      }
    </div>
  )
}

function PositionsCard() {
  const { data, loading } = useFetch(() => getPortfolio(), [], 30_000)
  const positions = data?.market_positions ?? []
  const wcPositions = positions.filter(p =>
    ['world cup', 'fifa', 'soccer', 'wc26'].some(t =>
      (p.market_title ?? '').toLowerCase().includes(t)
    )
  )

  return (
    <div className="card positions-card">
      <div className="section-label">Open Positions</div>
      {loading
        ? <div className="spinner" />
        : wcPositions.length === 0
          ? <div className="empty">No open WC positions</div>
          : wcPositions.map(p => (
            <div key={p.ticker} className="position-row">
              <div className="position-title">{p.market_title}</div>
              <div className="position-meta">
                <span className={`pill ${p.position > 0 ? 'pill-green' : 'pill-red'}`}>
                  {p.position > 0 ? 'YES' : 'NO'} ×{Math.abs(p.position)}
                </span>
                <span className="mono muted">{toDollars(p.market_exposure)}</span>
              </div>
            </div>
          ))
      }
    </div>
  )
}

function TradeHistoryCard() {
  const { data, loading } = useFetch(() => getMyTrades(), [], 60_000)
  const trades = data?.trades ?? []

  return (
    <div className="card history-card">
      <div className="section-label">Recent Trades</div>
      {loading
        ? <div className="spinner" />
        : trades.length === 0
          ? <div className="empty">No recent trades</div>
          : trades.slice(0, 10).map(t => (
            <div key={t.trade_id} className="trade-row">
              <span className="trade-ticker mono dimmed">{t.ticker}</span>
              <span className={`pill ${t.is_taker ? 'pill-gold' : 'pill-blue'}`}>
                {t.is_taker ? 'taker' : 'maker'}
              </span>
              <span className="trade-price mono accent">{toDollars(t.yes_price)}</span>
              <span className="trade-count mono muted">×{t.count}</span>
            </div>
          ))
      }
    </div>
  )
}

function MarketBrowser({ markets }) {
  const [selected, setSelected] = useState(null)
  const [side, setSide] = useState('yes')
  const [contracts, setContracts] = useState(1)
  const [placing, setPlacing] = useState(false)
  const [result, setResult] = useState(null)

  async function handleTrade() {
    if (!selected) return
    setPlacing(true)
    setResult(null)
    try {
      const price = side === 'yes'
        ? parseFloat(selected.yes_bid ?? 0.5)
        : parseFloat(selected.no_bid ?? 0.5)
      await placeOrder({ ticker: selected.ticker, side, count: contracts, type: 'market', price })
      setResult({ ok: true, msg: 'Order placed!' })
    } catch (e) {
      setResult({ ok: false, msg: e.message })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="card market-browser">
      <div className="section-label">WC Markets</div>
      <div className="market-list">
        {markets.slice(0, 20).map(m => (
          <div
            key={m.ticker}
            className={`market-row ${selected?.ticker === m.ticker ? 'selected' : ''}`}
            onClick={() => setSelected(m)}
          >
            <span className="market-title">{m.title}</span>
            <span className="market-yes accent mono">{toPercent(m.yes_bid)}</span>
          </div>
        ))}
      </div>

      {selected && (
        <div className="trade-panel">
          <div className="trade-panel-title">{selected.title}</div>
          <div className="side-toggle">
            <button className={`side-btn ${side === 'yes' ? 'active-yes' : ''}`} onClick={() => setSide('yes')}>
              YES · {toPercent(selected.yes_bid)}
            </button>
            <button className={`side-btn ${side === 'no' ? 'active-no' : ''}`} onClick={() => setSide('no')}>
              NO · {toPercent(selected.no_bid)}
            </button>
          </div>
          <div className="contracts-row">
            <label className="dimmed mono" style={{ fontSize: 11 }}>Contracts</label>
            <input
              className="contracts-input"
              type="number"
              min="1"
              value={contracts}
              onChange={e => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <button className="place-btn" onClick={handleTrade} disabled={placing}>
            {placing ? 'Placing...' : `Buy ${side.toUpperCase()} ×${contracts}`}
          </button>
          {result && (
            <div className={`trade-result ${result.ok ? 'ok' : 'err'}`}>{result.msg}</div>
          )}
        </div>
      )}
    </div>
  )
}
