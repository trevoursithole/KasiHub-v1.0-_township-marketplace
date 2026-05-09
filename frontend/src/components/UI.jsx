import { useNavigate } from 'react-router-dom'

export function ListingCard({ listing }) {
  const nav = useNavigate()
  const isFlash = listing.is_flash_sale && listing.flash_ends_at && new Date(listing.flash_ends_at) > new Date()
  return (
    <div className="card card-hover" style={{ minWidth: 152, maxWidth: 152, overflow: 'hidden', flexShrink: 0 }}
      onClick={() => nav(`/listing/${listing.id}`)}>
      <div style={{ height: 96, background: '#FEF0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
        {listing.emoji || '📦'}
        {listing.is_verified ? <div className="badge badge-green" style={{ position: 'absolute', bottom: 6, left: 6 }}>✓ Verified</div> : null}
        {isFlash ? <div className="badge badge-red" style={{ position: 'absolute', top: 6, right: 6 }}>⚡ FLASH</div> : null}
      </div>
      <div style={{ padding: '9px 10px 10px' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>{listing.title}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 7 }}>{listing.seller_name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 800, color: 'var(--ochre)' }}>R{listing.price}</div>
          <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>📍 {listing.section}</div>
        </div>
      </div>
    </div>
  )
}

export function FlashCard({ listing }) {
  const nav = useNavigate()
  const ends = listing.flash_ends_at ? new Date(listing.flash_ends_at) : null
  const diff = ends ? Math.max(0, ends - new Date()) : 0
  const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000)
  return (
    <div style={{ minWidth: 140, background: 'var(--night2)', borderRadius: 'var(--radius)', padding: 12, flexShrink: 0, cursor: 'pointer', position: 'relative' }}
      onClick={() => nav(`/listing/${listing.id}`)}>
      <div className="badge badge-red" style={{ position: 'absolute', top: 10, right: 10 }}>{h}H {m}M</div>
      <div style={{ fontSize: 26, marginBottom: 7 }}>{listing.emoji}</div>
      <div style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>{listing.title}</div>
      <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>R{listing.price}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
        ⏱ {h}h {String(m).padStart(2,'0')}m left
      </div>
    </div>
  )
}

export function RunnerCard({ runner, onHire }) {
  return (
    <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--green-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {runner.transport === 'bicycle' ? '🚴' : '🏃'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{runner.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-green">✓ Verified</span>
          <span className="stars" style={{ fontSize: 11 }}>{'★'.repeat(Math.round(runner.rating || 5))}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{runner.total_deliveries} deliveries</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 800, color: 'var(--ochre)', marginBottom: 4 }}>R{runner.rate}</div>
        {onHire && <button className="btn btn-green" style={{ height: 30, fontSize: 11, padding: '0 10px', borderRadius: 8 }} onClick={() => onHire(runner)}>Hire</button>}
      </div>
    </div>
  )
}

export function ZoneCard({ zone }) {
  return (
    <div className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '.5px solid var(--border2)' }}>
        <div style={{ width: 36, height: 36, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {zone.type === 'PETROL' ? '⛽' : zone.type === 'MALL' ? '🏬' : zone.type === 'POLICE' ? '🚔' : '🏘️'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{zone.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{zone.type} · {zone.hours}</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>{zone.distance_km}km</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>~{zone.walk_minutes} min walk{zone.has_cctv ? ' · CCTV' : ''}</div>
        </div>
        <button className="btn btn-green" style={{ height: 34, fontSize: 12, padding: '0 14px', borderRadius: 8 }}
          onClick={() => alert(`Navigate to ${zone.name}`)}>Navigate →</button>
      </div>
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" />
}

export function EmptyState({ emoji, message }) {
  return (
    <div className="empty-state">
      <div className="emoji">{emoji}</div>
      <p>{message}</p>
    </div>
  )
}

export function Avatar({ initials, size = 'md' }) {
  return <div className={`avatar avatar-${size}`}>{initials}</div>
}
