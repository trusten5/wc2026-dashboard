import { NavLink } from 'react-router-dom'
import './Nav.css'

const links = [
  { to: '/',          label: 'Today',       icon: '⚽' },
  { to: '/stats',     label: 'Stats',       icon: '📊' },
  { to: '/trophy',    label: 'Trophy Race', icon: '🏆' },
  { to: '/bracket',   label: 'Bracket',     icon: '🗂' },
  { to: '/trade',     label: 'Trade',       icon: '💹' },
]

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-logo">WC</span>
        <span className="nav-year">2026</span>
      </div>
      <div className="nav-links">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{l.icon}</span>
            <span className="nav-label">{l.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
