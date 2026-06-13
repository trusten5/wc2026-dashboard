# WC 2026 Dashboard

A live World Cup 2026 dashboard combining ESPN match data with Kalshi prediction market odds.

## Screens

- **Today** — Live scores, Game of the Day (by Kalshi volume), biggest market movers, group standings
- **Stats** — Top scorers, assists, and player stat leaders
- **Trophy Race** — Kalshi win probabilities for all 48 teams, ranked
- **Schedule** — Full 104-match schedule with date picker
- **Trade** — Connect your Kalshi account to view positions and place trades

## Stack

- React + Vite
- ESPN public API (no auth) — live scores, standings, player stats
- Kalshi public API (no auth for market data, API key for trading)

## Setup

```bash
npm install
npm run dev
```

## Trading

Go to the Trade screen and paste your Kalshi API key. It's stored in `localStorage` only — never committed or sent anywhere except Kalshi's API directly.

## Data sources

- **ESPN**: `site.api.espn.com/apis/site/v2/sports/soccer/fifa.world` — undocumented public API, no key needed
- **Kalshi**: `external-api.kalshi.com/trade-api/v2` — public market data free, trading requires API key

## TODO

- [ ] Kalshi series ticker discovery (find exact WC series tickers)
- [ ] Odds bar on match cards (need to map ESPN teams → Kalshi markets)
- [ ] Upset tracker screen (results vs. Kalshi pre-match probabilities)
- [ ] Stadium map screen
- [ ] Head-to-head comparison screen
- [ ] Price history chart for top 5 trophy race teams
- [ ] Kalshi WebSocket for real-time price updates
