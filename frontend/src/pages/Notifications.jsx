import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../api'
import { Spinner, EmptyState } from '../components/UI'

export default function Notifications() {
  const nav = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsAPI.getAll()
      .then(r => { setNotifs(r.data); setLoading(false) })
      .catch(() => setLoading(false))
    notificationsAPI.readAll().catch(() => {})
  }, [])

  const iconBg = { runner_update: 'var(--green-lt)', new_order: 'var(--ochre-lt)', review: 'var(--gold-lt)', flash_sale: 'var(--ochre-lt)', verification: 'var(--green-lt)', message: 'var(--ochre-lt)', payment_released: 'var(--green-lt)' }

  return (
    <div>
      <div style={{ background: 'var(--night)', padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <i className="fas fa-arrow-left" style={{ color: '#fff', fontSize: 20 }} />
        </button>
        <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, color: '#fff' }}>Notifications</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{notifs.filter(n => !n.is_read).length} unread</div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading
          ? <Spinner />
          : notifs.length === 0
            ? <EmptyState emoji="🔔" message="No notifications yet.\nWe'll alert you on orders, messages & more." />
            : notifs.map(n => (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: 14,
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  background: n.is_read ? '#fff' : 'var(--ochre-pale)',
                  borderColor: n.is_read ? 'var(--border)' : 'var(--ochre-lt)',
                  transition: 'background .15s',
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: iconBg[n.type] || 'var(--sand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {n.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{n.title}</div>
                    {!n.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ochre)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginTop: 3 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 5 }}>
                    {new Date(n.created_at).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}
