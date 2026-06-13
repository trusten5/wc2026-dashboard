import { createContext, useContext, useState, useEffect } from 'react'
import { getStoredKey, setStoredKey, clearStoredKey, getWCMarkets, getMarketsBySeries, WC_SERIES, sortByVolume } from '../api/kalshi'

const KalshiCtx = createContext(null)

export function KalshiProvider({ children }) {
  const [apiKey, setApiKey] = useState(getStoredKey())
  const [markets, setMarkets] = useState([])
  const [winnerMarkets, setWinnerMarkets] = useState([])
  const [marketsLoading, setMarketsLoading] = useState(true)

  function saveKey(key) {
    if (key) setStoredKey(key)
    else clearStoredKey()
    setApiKey(key)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetch all WC markets + winner markets in parallel
        const [all, winners] = await Promise.all([
          getWCMarkets(),
          getMarketsBySeries(WC_SERIES.winner),
        ])
        if (!cancelled) {
          setMarkets(sortByVolume(all))
          // Sort winner markets by yes_bid descending (highest win prob first)
          setWinnerMarkets(
            [...winners].sort((a, b) => parseFloat(b.yes_bid_dollars ?? 0) - parseFloat(a.yes_bid_dollars ?? 0))
          )
        }
      } catch (e) {
        console.warn('Kalshi markets failed:', e.message)
      } finally {
        if (!cancelled) setMarketsLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <KalshiCtx.Provider value={{ apiKey, saveKey, markets, winnerMarkets, marketsLoading, hasKey: !!apiKey }}>
      {children}
    </KalshiCtx.Provider>
  )
}

export function useKalshi() {
  return useContext(KalshiCtx)
}