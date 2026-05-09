import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const nav = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()

  if (!user) { nav('/login'); return null }

  const rating = parseFloat(user.rating) || 0
  const earned = user.total_earnings > 999
    ? 'R' + (user.total_earnings / 1000).toFixed(1) + 'k'
    : 'R' + (user.total_earnings || 0)

  const menuSections = [
    {
      label: 'My account',
      items: [
        { icon: 'fas fa-list', bg: 'var(--ochre-lt)', ic: 'var(--ochre)', title: 'My listings', sub: `${user.total_sales || 0} sold`, action: () => nav('/') },
        { icon: 'fas fa-receipt', bg: 'var(--green-lt)', ic: 'var(--green)', title: 'Transactions', sub: 'History & digital receipts', action: () => nav('/transactions') },
        { icon: 'fas fa-bell', bg: 'var(--gold-lt)', ic: 'var(--gold)', title: 'Notifications', sub: 'View all alerts', action: () => nav('/notifications') },
        { icon: 'fas fa-running', bg: 'var(--green-lt)', ic: 'var(--green)', title: 'Runner network', sub: user.is_runner ? 'You are a runner' : 'Browse runners', action: () => nav('/runners') },
      ]
    },
    {
      label: 'Safety & Trust',
      items: [
        { icon: 'fas fa-lock', bg: 'var(--ochre-lt)', ic: 'var(--ochre)', title: 'Escrow balance', sub: 'No funds currently locked', action: () => toast('🔒', 'Escrow', 'No active escrow transactions') },
        { icon: 'fas fa-id-card', bg: 'var(--green-lt)', ic: 'var(--green)', title: 'Verification status', sub: `${user.verification_anchors || 0} community anchors`, action: () => toast('🏅', 'Verified', `${user.verification_anchors || 0} community vouches`) },
        { icon: 'fas fa-shield-alt', bg: 'var(--green-lt)', ic: 'var(--green)', title: 'Safe-Trade Zones', sub: '3 verified zones near you', action: () => nav('/zones') },
        { icon: 'fas fa-flag', bg: 'var(--red-lt)', ic: 'var(--red)', title: 'Report a bad actor', sub: 'Keep the Kasi safe', action: () => toast('🚩', 'Report', 'Report submitted — thank you') },
      ]
    },
  ]

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ background: 'var(--night)', padding: '24px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div className="avatar avatar-lg" style={{ marginBottom: 12 }}>{user.avatar_initials}</div>
        <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{user.name}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
          <i className="fas fa-map-marker-alt" style={{ marginRight: 5 }} />{user.section}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user.is_verified ? (
            <span style={{ background: 'rgba(30,100,60,.35)', color: '#6EE09A', border: '.5px solid rgba(110,224,154,.3)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, fontFamily: 'Syne', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <i className="fas fa-check-circle" /> Verified Resident
            </span>
          ) : (
            <span style={{ background: 'rgba(200,101,26,.2)', color: 'var(--gold)', border: '.5px solid rgba(232,162,42,.3)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, fontFamily: 'Syne' }}>
              ⏳ Pending Verification
            </span>
          )}
          {(user.total_sales || 0) > 10 && (
            <span style={{ background: 'rgba(232,162,42,.2)', color: 'var(--gold)', border: '.5px solid rgba(232,162,42,.3)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, fontFamily: 'Syne' }}>
              ⭐ Top Seller
            </span>
          )}
          {user.is_runner ? (
            <span style={{ background: 'rgba(27,100,56,.35)', color: '#6EE09A', border: '.5px solid rgba(110,224,154,.3)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, fontFamily: 'Syne' }}>
              🚴 Active Runner
            </span>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 20px' }}>
        {[
          [earned, 'Total earned'],
          [user.total_sales || 0, 'Items sold'],
          [rating > 0 ? rating.toFixed(1) : '—', 'Star rating'],
        ].map(([val, lbl]) => (
          <div key={lbl} className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontSize: 19, fontWeight: 800, color: 'var(--ochre)' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, fontWeight: 500, lineHeight: 1.3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Rating bar */}
      {rating > 0 && (
        <div style={{ margin: '0 20px 8px', padding: '12px 14px', background: '#fff', borderRadius: 12, border: '.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 800, color: 'var(--text)' }}>{rating.toFixed(1)}</div>
          <div style={{ flex: 1 }}>
            <div className="stars" style={{ fontSize: 18 }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Based on {user.total_sales || 0} transactions</div>
          </div>
        </div>
      )}

      {/* Menu sections */}
      {menuSections.map(section => (
        <div key={section.label} style={{ padding: '12px 20px 4px' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 11, fontWeight: 700, color: 'var(--muted2)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {section.label}
          </div>
          {section.items.map(item => (
            <div
              key={item.title}
              onClick={item.action}
              className="card"
              style={{ padding: '13px 14px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background .15s' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={item.icon} style={{ fontSize: 15, color: item.ic }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{item.sub}</div>
              </div>
              <i className="fas fa-chevron-right" style={{ color: 'var(--muted2)', fontSize: 13 }} />
            </div>
          ))}
        </div>
      ))}

      {/* Sign out */}
      <div style={{ padding: '12px 20px 0' }}>
        <button
          className="btn"
          style={{ background: 'var(--red-lt)', color: 'var(--red)', height: 48, width: '100%', fontSize: 14, borderRadius: 'var(--radius)' }}
          onClick={() => { logout(); nav('/') }}
        >
          <i className="fas fa-sign-out-alt" /> Sign out
        </button>
      </div>
    </div>
  )
}
