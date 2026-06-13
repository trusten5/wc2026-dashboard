import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { KalshiProvider } from './hooks/useKalshi'
import Nav from './components/Nav'
import Today from './screens/Today'
import Stats from './screens/Stats'
import TrophyRace from './screens/TrophyRace'
import Bracket from './screens/Bracket'
import Trade from './screens/Trade'
import './App.css'

export default function App() {
  return (
    <KalshiProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Nav />
          <main className="app-main">
            <Routes>
              <Route path="/"        element={<Today />} />
              <Route path="/stats"   element={<Stats />} />
              <Route path="/trophy"  element={<TrophyRace />} />
              <Route path="/bracket" element={<Bracket />} />
              <Route path="/trade"   element={<Trade />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </KalshiProvider>
  )
}
