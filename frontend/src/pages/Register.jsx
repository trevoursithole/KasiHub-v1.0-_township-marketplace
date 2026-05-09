import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const SECTIONS = ['Block L', 'Ext 4', 'Mamelodi West', 'Soshanguve', 'Thembisa', 'Alexandra', 'Soweto', 'Katlehong']

export default function Register() {
  const nav = useNavigate()
  const { register } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', phone: '', password: '', section: 'Block L' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (form.password.length < 6) { toast('⚠️', 'Weak password', 'At least 6 characters required'); return }
    setLoading(true)
    try {
      await register(form)
      toast('🎉', 'Welcome to KasiHub!', 'Your account is ready')
      nav('/')
    } catch (err) {
      toast('❌', 'Registration failed', err.response?.data?.error || 'Try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--night)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '32px 28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
        <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#fff' }}>
          KASI<span style={{ color: 'var(--gold)' }}>HUB</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>Join the township marketplace</div>
      </div>

      <div style={{ background: 'var(--cream)', borderRadius: '24px 24px 0 0', flex: 1, padding: '28px 24px' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Create account</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Free to join · Sell in minutes</div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" placeholder="e.g. Thabo Dlamini" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>🇿🇦</span>
              <input className="form-input" style={{ paddingLeft: 40 }} type="tel" placeholder="082 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Your section</label>
            <select className="form-input" value={form.section} onChange={e => set('section', e.target.value)}>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="At least 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {['🛡️ Voucher Escrow', '✓ Verified badges', '🚴 Runner network'].map(b => (
              <div key={b} style={{ fontSize: 11, background: 'var(--green-pale)', color: 'var(--green)', borderRadius: 20, padding: '4px 10px', border: '.5px solid var(--green-lt)', fontWeight: 500 }}>{b}</div>
            ))}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ opacity: loading ? .7 : 1 }}>
            {loading ? '⏳ Creating account…' : 'Create free account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--ochre)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
        </div>
      </div>
    </div>
  )
}
