import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.phone, form.password)
      toast('👋', 'Welcome back!', 'Logged in successfully')
      nav('/')
    } catch (err) {
      toast('❌', 'Login failed', err.response?.data?.error || 'Check your details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--night)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '40px 28px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
        <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>
          KASI<span style={{ color: 'var(--gold)' }}>HUB</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>
          Township Marketplace — Buy & Sell Locally
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: 'var(--cream)', borderRadius: '24px 24px 0 0', flex: 1, padding: '32px 24px' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Sign in</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Enter your phone & password to continue</div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Phone number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>🇿🇦</span>
              <input
                className="form-input"
                style={{ paddingLeft: 40 }}
                type="tel"
                placeholder="082 123 4567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, opacity: loading ? .7 : 1 }}
          >
            {loading ? '⏳ Signing in…' : 'Sign in →'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 20, padding: 14, background: 'var(--sand)', borderRadius: 12, border: '1px solid var(--border2)' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 11, fontWeight: 700, color: 'var(--muted2)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Demo accounts</div>
          {[
            { name: 'Thandeka Mokoena', phone: '0821234567' },
            { name: 'Mama Dlamini', phone: '0829876543' },
            { name: 'Sipho Mokoena', phone: '0831112233' },
          ].map(u => (
            <button
              key={u.phone}
              onClick={() => setForm({ phone: u.phone, password: 'password123' })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: '#fff', border: '.5px solid var(--border)', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', marginBottom: 6, textAlign: 'left' }}
            >
              <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.phone} · password123</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--ochre)', fontWeight: 700, textDecoration: 'none' }}>Register free →</Link>
        </div>
      </div>
    </div>
  )
}
