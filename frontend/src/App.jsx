import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Sell from './pages/Sell'
import Runners from './pages/Runners'
import Zones from './pages/Zones'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => { const n = new Date(); setTime(`${n.getHours()}:${String(n.getMinutes()).padStart(2,'0')}`) }
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id)
  }, [])

  if (loading) return (
    <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🏪</div>
      <div className="spinner" />
    </div>
  )

  const isAuth = loc.pathname === '/login' || loc.pathname === '/register'
  const tab = loc.pathname === '/' ? 'home' : loc.pathname === '/zones' ? 'zones' : loc.pathname === '/runners' ? 'runners' : loc.pathname === '/profile' ? 'profile' : ''

  return (
    <ToastProvider>
      <div className="app-shell">
        <div className="status-bar">
          <span className="status-time">{time}</span>
          <div className="status-icons">
            <i className="fas fa-signal" />
            <i className="fas fa-wifi" />
            <i className="fas fa-battery-three-quarters" />
          </div>
        </div>
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/sell" element={user ? <Sell /> : <Login />} />
            <Route path="/runners" element={<Runners />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Login />} />
            <Route path="/transactions" element={user ? <Transactions /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        {!isAuth && (
          <nav className="bottom-nav">
            <button className={`nav-item ${tab==='home'?'active':''}`} onClick={() => nav('/')}><i className="fas fa-home" /><span>Home</span></button>
            <button className={`nav-item ${tab==='zones'?'active':''}`} onClick={() => nav('/zones')}><i className="fas fa-shield-alt" /><span>Zones</span></button>
            <button className="nav-center" onClick={() => nav(user?'/sell':'/login')}><i className="fas fa-plus" /></button>
            <button className={`nav-item ${tab==='runners'?'active':''}`} onClick={() => nav('/runners')}><i className="fas fa-running" /><span>Runners</span></button>
            <button className={`nav-item ${tab==='profile'?'active':''}`} onClick={() => nav(user?'/profile':'/login')}><i className="fas fa-user" /><span>Profile</span></button>
          </nav>
        )}
      </div>
    </ToastProvider>
  )
}
