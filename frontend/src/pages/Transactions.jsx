import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionsAPI } from '../api'
import { Spinner, EmptyState } from '../components/UI'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const STATUS_COLOR = { escrow_locked: 'var(--gold)', completed: 'var(--green)', cancelled: 'var(--red)' }
const STATUS_LABEL = { escrow_locked: '⏳ In Escrow', completed: '✅ Complete', cancelled: '❌ Cancelled' }
const STATUS_BG = { escrow_locked: 'var(--gold-lt)', completed: 'var(--green-lt)', cancelled: 'var(--red-lt)' }

export default function Transactions() {
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)

  useEffect(() => {
    transactionsAPI.getAll()
      .then(r => { setTxs(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function confirmDelivery(tx) {
    setCompleting(tx.id)
    try {
      await transactionsAPI.complete(tx.id)
      toast('✅', 'Delivery confirmed!', `R${tx.total} released to seller`)
      setTxs(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t))
    } catch (e) {
      toast('❌', 'Error', e.response?.data?.error || 'Could not confirm delivery')
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div>
      <div style={{ background: 'var(--night)', padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <i className="fas fa-arrow-left" style={{ color: '#fff', fontSize: 20 }} />
        </button>
        <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 800, color: '#fff' }}>Transactions</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{txs.length} total</div>
      </div>

      {/* Summary stats */}
      {txs.length > 0 && (
        <div style={{ background: 'var(--night2)', padding: '12px 20px', display: 'flex', gap: 24 }}>
          {[
            ['R' + txs.filter(t => t.status === 'completed').reduce((s, t) => s + t.total, 0).toFixed(0), 'Spent'],
            [txs.filter(t => t.status === 'completed').length, 'Completed'],
            [txs.filter(t => t.status === 'escrow_locked').length, 'In escrow'],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading
          ? <Spinner />
          : txs.length === 0
            ? <EmptyState emoji="🧾" message="No transactions yet.\nMake your first purchase to see your receipts here." />
            : txs.map(tx => (
              <div key={tx.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card header */}
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '.5px solid var(--border2)' }}>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{tx.emoji || '📦'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Ref: {tx.reference}</div>
                  </div>
                  <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--ochre)', flexShrink: 0 }}>R{tx.total}</div>
                </div>

                {/* Card body */}
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>
                        {tx.buyer_id === user?.id ? `Seller: ${tx.seller_name}` : `Buyer: ${tx.buyer_name}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {new Date(tx.created_at).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <span style={{
                      background: STATUS_BG[tx.status] || 'var(--sand)',
                      color: STATUS_COLOR[tx.status] || 'var(--muted)',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Syne',
                      alignSelf: 'flex-start',
                    }}>
                      {STATUS_LABEL[tx.status] || tx.status}
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div style={{ background: 'var(--sand)', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 16 }}>
                    <span>Item: <strong style={{ color: 'var(--text)' }}>R{tx.item_price}</strong></span>
                    {tx.runner_fee > 0 && <span>Runner: <strong style={{ color: 'var(--text)' }}>R{tx.runner_fee}</strong></span>}
                    <span>Method: <strong style={{ color: 'var(--text)' }}>{tx.delivery_method}</strong></span>
                  </div>

                  {/* QR confirm button for in-escrow buyer transactions */}
                  {tx.status === 'escrow_locked' && tx.buyer_id === user?.id && (
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 10, height: 42, fontSize: 13 }}
                      disabled={completing === tx.id}
                      onClick={() => confirmDelivery(tx)}
                    >
                      {completing === tx.id ? '⏳ Confirming…' : '📱 Scan QR — Confirm delivery'}
                    </button>
                  )}

                  {tx.status === 'escrow_locked' && tx.seller_id === user?.id && (
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--gold-lt)', borderRadius: 8, fontSize: 11, color: '#8a6010' }}>
                      ⏳ Waiting for buyer to confirm delivery before funds are released to you.
                    </div>
                  )}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}
