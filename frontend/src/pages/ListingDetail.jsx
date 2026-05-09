import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listingsAPI, transactionsAPI, runnersAPI } from '../api'
import { Spinner, RunnerCard } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ListingDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [runners, setRunners] = useState([])
  const [method, setMethod] = useState('runner')
  const [selectedRunner, setSelectedRunner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [tx, setTx] = useState(null)

  useEffect(() => {
    listingsAPI.getOne(id).then(r => { setListing(r.data); setLoading(false) }).catch(() => nav('/'))
    runnersAPI.getAll().then(r => { setRunners(r.data.slice(0,3)); if (r.data[0]) setSelectedRunner(r.data[0]) })
  }, [id])

  async function buy() {
    if (!user) { nav('/login'); return }
    setBuying(true)
    try {
      const r = await transactionsAPI.create({
        listing_id: listing.id,
        runner_id: method === 'runner' ? selectedRunner?.id : undefined,
        delivery_method: method,
      })
      setTx(r.data)
      toast('🔒', 'Voucher locked!', `Ref: ${r.data.reference}`)
    } catch (e) {
      toast('❌', 'Error', e.response?.data?.error || 'Could not place order')
    } finally {
      setBuying(false)
    }
  }

  async function confirmDelivery() {
    try {
      await transactionsAPI.complete(tx.id)
      toast('✅', 'Delivery confirmed!', 'Payment released to seller')
      setTimeout(() => nav('/transactions'), 1500)
    } catch (e) {
      toast('❌', 'Error', 'Could not confirm')
    }
  }

  if (loading) return <><div style={{ height: 220, background: 'var(--ochre-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>📦</div><Spinner /></>
  if (!listing) return null

  const runnerFee = method === 'runner' && selectedRunner ? selectedRunner.rate : 0
  const total = listing.price + runnerFee

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Image area */}
      <div style={{ height: 220, background: 'var(--ochre-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, position: 'relative' }}>
        {listing.emoji || '📦'}
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => nav(-1)} style={{ width: 38, height: 38, background: 'rgba(255,255,255,.9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <i className="fas fa-arrow-left" style={{ color: 'var(--text)', fontSize: 16 }} />
          </button>
          <button style={{ width: 38, height: 38, background: 'rgba(255,255,255,.9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            onClick={() => toast('❤️', 'Saved!', 'Added to wishlist')}>
            <i className="fas fa-heart" style={{ color: 'var(--red)', fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* If transaction placed — show QR / Receipt */}
      {tx ? (
        <div style={{ padding: 20 }}>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ background: 'var(--night)', padding: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>KASI<span style={{ color: 'var(--gold)' }}>HUB</span></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Secure Voucher Escrow</div>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 140, height: 140, background: 'var(--cream)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: 100, height: 100, backgroundImage: 'repeating-conic-gradient(var(--text) 0% 25%, var(--cream) 0% 50%)', backgroundSize: '14px 14px', borderRadius: 4, opacity: .85 }} />
                <div style={{ position: 'absolute', width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>K</div>
              </div>
              <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, letterSpacing: '.06em' }}>REF: {tx.reference}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'var(--gold-lt)', fontSize: 12, fontWeight: 700, fontFamily: 'Syne', color: '#8a6010' }}>⏳ Awaiting delivery scan</div>
            </div>
            {[['Item', listing.title], ['Seller', listing.seller_name], ['Method', method], ['Item price', `R${listing.price}`], ['Runner fee', `R${runnerFee}`], ['Total locked', `R${total}`]].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 20px', borderTop: '.5px solid var(--border2)' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: k === 'Total locked' ? 'var(--ochre)' : 'var(--text)', fontFamily: k === 'Total locked' ? 'Syne' : undefined, fontSize: k === 'Total locked' ? 14 : 12 }}>{v}</div>
              </div>
            ))}
            <div style={{ padding: '16px 20px', background: 'var(--green)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>🛡️ Your money is protected</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>Funds release only when you scan this QR</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={confirmDelivery}>✅ Confirm delivery — Release R{total}</button>
        </div>
      ) : (
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{listing.title}</div>
            <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: 'var(--ochre)', whiteSpace: 'nowrap' }}>R{listing.price}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
            <i className="fas fa-map-marker-alt" style={{ color: 'var(--green)', fontSize: 13 }} />
            {listing.section} · {listing.condition} condition · {listing.views} views
          </div>

          {/* Seller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--sand)', borderRadius: 10, marginBottom: 14, cursor: 'pointer' }}>
            <div className="avatar avatar-md">{listing.avatar_initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{listing.seller_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {listing.is_verified ? <span className="badge badge-green">✓ Verified</span> : null}
                <span className="stars" style={{ fontSize: 12 }}>{'★'.repeat(Math.round(listing.seller_rating || 4))}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{listing.total_sales} sales</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>{listing.description}</div>

          {/* Delivery method */}
          <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>How would you like to get it?</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['runner', 'fas fa-running', 'Runner\ndelivery'], ['zone', 'fas fa-shield-alt', 'Safe-Trade\nZone'], ['pickup', 'fas fa-home', 'Seller\npickup']].map(([m, icon, label]) => (
              <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '11px 6px', borderRadius: 12, border: `1.5px solid ${method === m ? 'var(--green)' : 'var(--border)'}`, background: method === m ? 'var(--green-pale)' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all .2s' }}>
                <i className={icon} style={{ fontSize: 22, color: method === m ? 'var(--green)' : 'var(--muted)' }} />
                <span style={{ fontSize: 10, fontWeight: method === m ? 700 : 500, color: method === m ? 'var(--green)' : 'var(--text2)', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Runner selector */}
          {method === 'runner' && runners.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>Select a runner</div>
              {runners.map(r => (
                <div key={r.id} onClick={() => setSelectedRunner(r)} style={{ padding: 12, border: `1.5px solid ${selectedRunner?.id === r.id ? 'var(--green)' : 'var(--border)'}`, borderRadius: 12, marginBottom: 8, background: selectedRunner?.id === r.id ? 'var(--green-pale)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{r.transport === 'bicycle' ? '🚴' : '🏃'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.total_deliveries} deliveries · ⭐{r.rating}</div>
                  </div>
                  <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 800, color: 'var(--ochre)' }}>R{r.rate}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button onClick={() => toast('💬', 'WhatsApp', `Opening chat with ${listing.seller_name}…`)} style={{ width: 50, height: 50, background: 'var(--green)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <i className="fab fa-whatsapp" style={{ color: '#fff', fontSize: 22 }} />
            </button>
            <button className="btn btn-primary" onClick={buy} disabled={buying} style={{ flex: 1, opacity: buying ? .7 : 1 }}>
              {buying ? '⏳ Processing…' : <><i className="fas fa-lock" style={{ color: 'rgba(255,255,255,.8)', fontSize: 14 }} /> Lock Voucher · R{total}</>}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--ochre-pale)', borderRadius: 10, padding: '10px 12px' }}>
            <i className="fas fa-shield-alt" style={{ color: 'var(--ochre)', fontSize: 15, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
              Payment held in <strong style={{ color: 'var(--ochre2)' }}>Voucher Escrow</strong> — seller only receives funds once you scan the QR on delivery.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
