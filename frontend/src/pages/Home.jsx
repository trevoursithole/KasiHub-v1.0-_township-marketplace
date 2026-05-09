import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsAPI, runnersAPI, statsAPI } from '../api'
import { ListingCard, FlashCard, Spinner, EmptyState } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const SECTIONS = ['Block L', 'Ext 4', 'Mam. West', 'Thembisa', 'All']
const CATS = [
  { emoji: '🍖', label: 'Food', cat: 'Food' },
  { emoji: '📱', label: 'Electronics', cat: 'Electronics' },
  { emoji: '🔧', label: 'Services', cat: 'Services' },
  { emoji: '👗', label: 'Fashion', cat: 'Fashion' },
  { emoji: '🏪', label: 'Spaza', cat: 'Spaza' },
  { emoji: '📚', label: 'Education', cat: 'Education' },
  { emoji: '💅', label: 'Beauty', cat: 'Beauty' },
  { emoji: '•••', label: 'More', cat: null },
]

export default function Home() {
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [section, setSection] = useState('Block L')
  const [listings, setListings] = useState([])
  const [flash, setFlash] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [section])

  async function load() {
    setLoading(true)
    try {
      const [lr, fr, sr] = await Promise.all([
        listingsAPI.getAll({ section: section === 'All' ? undefined : section, limit: 10 }),
        listingsAPI.getAll({ flash: '1', limit: 6 }),
        statsAPI.platform(),
      ])
      setListings(lr.data.listings || [])
      setFlash(fr.data.listings || [])
      setStats(sr.data)
    } catch (e) {
      toast('❌', 'Error', 'Could not load listings')
    } finally {
      setLoading(false)
    }
  }

  async function doSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true)
    try {
      const r = await listingsAPI.getAll({ search, limit: 20 })
      setListings(r.data.listings || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="brand">KASI<span>HUB</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user && (
            <button className="icon-btn" onClick={() => nav('/notifications')} style={{ position: 'relative' }}>
              <i className="fas fa-bell" />
              <div className="notif-dot" />
            </button>
          )}
          <button className="icon-btn" onClick={() => nav(user ? '/profile' : '/login')}>
            <i className={user ? 'fas fa-user-check' : 'fas fa-user'} />
          </button>
        </div>
      </div>

      {/* Section pills */}
      <div className="section-pills">
        {SECTIONS.map(s => (
          <button key={s} className={`pill ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>
            {s === section && '📍 '}{s}
          </button>
        ))}
      </div>

      {/* Hero */}
      <div style={{ background: 'var(--night2)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,162,42,.15),transparent 70%)' }} />
        <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          <span className="live-dot" style={{ marginRight: 6 }} />
          {stats ? `${stats.listings} listings near you` : 'Loading…'}
        </div>
        <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.18, marginBottom: 6 }}>
          Bheka izinto<br />eduze kwakho
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.5, marginBottom: 14 }}>
          Find, buy & sell in your block — fast, safe, and local.
        </div>
        {stats && (
          <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
            {[['🏃', stats.runners, 'Runners online'], ['⚡', stats.flash, 'Flash sales'], ['🛡️', stats.zones, 'Safe zones']].map(([e, n, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.3 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['🛡️', 'Safe-Trade Zones'], ['🔒', 'Voucher Escrow'], ['🧾', 'Digital Receipts']].map(([i, t]) => (
            <div key={t} style={{ background: 'rgba(255,255,255,.08)', border: '.5px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', gap: 5 }}>
              {i} {t}
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={doSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 20px', background: '#fff', borderRadius: 10, border: '1px solid var(--border)', padding: '0 14px', height: 44 }}>
        <i className="fas fa-search" style={{ color: 'var(--muted)', fontSize: 15 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text)', background: 'transparent' }} placeholder={`Search listings in ${section}…`} />
        {search && <button type="submit" style={{ background: 'var(--ochre)', color: '#fff', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 700 }}>Go</button>}
      </form>

      {/* Categories */}
      <div className="sec-head"><div className="sec-title">Browse categories</div></div>
      <div style={{ display: 'flex', gap: 10, padding: '0 20px 16px', overflowX: 'auto' }} className="h-scroll">
        {CATS.map(({ emoji, label, cat }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => { if (cat) { setLoading(true); listingsAPI.getAll({ category: cat }).then(r => { setListings(r.data.listings || []); setLoading(false) }) } }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid var(--border2)', background: '#FEF0E0' }}>{emoji}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Nearby Listings */}
      <div className="sec-head">
        <div className="sec-title">Nearby listings</div>
        <button className="sec-action" onClick={load}>Refresh</button>
      </div>
      {loading ? <Spinner /> : listings.length === 0 ? <EmptyState emoji="🏚️" message="No listings in this area yet.\nBe the first to post!" /> : (
        <div className="h-scroll" style={{ paddingBottom: 4 }}>
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}

      {/* Runner Banner */}
      <div onClick={() => nav('/runners')} style={{ margin: '8px 20px', background: 'var(--green)', borderRadius: 'var(--radius)', padding: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', right: 14, bottom: -4, fontSize: 42, opacity: .3 }}>🚴</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="live-dot" />
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, color: '#fff' }}>Runner Network — LIVE</div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>{stats?.runners || 0} runners active · Avg delivery 12 min</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['🚴 Bicycle', '🏃 On foot', '⏱ Avg 12 min', '→ Book one'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#fff' }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Flash Sales */}
      {flash.length > 0 && <>
        <div className="sec-head">
          <div className="sec-title">⚡ Flash sales — ends soon</div>
          <button className="sec-action" onClick={() => nav('/') }>See all</button>
        </div>
        <div className="h-scroll" style={{ paddingBottom: 4 }}>
          {flash.map(l => <FlashCard key={l.id} listing={l} />)}
        </div>
      </>}

      {/* Safe Zones teaser */}
      <div className="sec-head">
        <div className="sec-title">Safe-Trade Zones</div>
        <button className="sec-action" onClick={() => nav('/zones')}>Map view</button>
      </div>
      <div style={{ margin: '0 20px 8px', border: '1px solid var(--green-lt)', background: 'var(--green-pale)', borderRadius: 'var(--radius)', padding: 14 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          🛡️ Vetted meet-up points
        </div>
        {[['Mamelodi Engen Garage', '0.4km', 'PETROL'], ['Sanlam Mall Entrance', '0.9km', 'MALL'], ['Block L Police Station', '1.2km', 'POLICE']].map(([n, d, t]) => (
          <div key={n} onClick={() => nav('/zones')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#fff', borderRadius: 10, marginBottom: 6, cursor: 'pointer', border: '.5px solid var(--border2)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{n}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-green" style={{ fontSize: 9 }}>{t}</span>
              <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{d}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 16 }} />
    </>
  )
}
