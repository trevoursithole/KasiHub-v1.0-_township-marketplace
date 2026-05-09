// Sell.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsAPI } from '../api'
import { useToast } from '../context/ToastContext'

const CATS = ['Food', 'Electronics', 'Fashion', 'Services', 'Furniture', 'Education', 'Beauty', 'Other']
const SECTIONS = ['Block L', 'Ext 4', 'Mamelodi West', 'Soshanguve', 'Thembisa']
const EMOJIS = { Food: '🍖', Electronics: '📱', Fashion: '👗', Services: '🔧', Furniture: '🪑', Education: '📚', Beauty: '💅', Other: '📦' }

export function Sell() {
  const nav = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Electronics', condition: 'Good', section: 'Block L', is_flash_sale: false, flash_hours: 4 })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.title || !form.price) return toast('⚠️', 'Missing fields', 'Title and price are required')
    setSaving(true)
    try {
      await listingsAPI.create({ ...form, price: parseFloat(form.price), emoji: EMOJIS[form.category] || '📦' })
      toast('🎉', 'Listing posted!', 'Your item is now live')
      setTimeout(() => nav('/'), 1200)
    } catch (e) {
      toast('❌', 'Error', e.response?.data?.error || 'Could not post listing')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ background: 'var(--night)', padding: '18px 20px 16px' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Post a listing</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Sell anything in your section — fast & free</div>
      </div>
      <form onSubmit={submit} style={{ padding: 20 }}>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: '#fff', marginBottom: 16 }}
          onClick={() => toast('📷', 'Camera', 'Photo upload coming soon!')}>
          <i className="fas fa-camera" style={{ fontSize: 28, color: 'var(--border)' }} />
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Tap to add photos</span>
        </div>

        <div className="form-group">
          <label className="form-label">Item title</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Samsung A14 — good condition" required />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Price (ZAR)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>R</span>
              <input className="form-input" style={{ paddingLeft: 30 }} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" required />
            </div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Condition</label>
            <select className="form-input" value={form.condition} onChange={e => set('condition', e.target.value)}>
              {['New', 'Good', 'Fair', 'For parts'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your item…" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Section</label>
            <select className="form-input" value={form.section} onChange={e => set('section', e.target.value)}>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_flash_sale} onChange={e => set('is_flash_sale', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ochre)' }} />
            ⚡ Flash sale (time-limited deal)
          </label>
          {form.is_flash_sale && (
            <select className="form-input" style={{ marginTop: 8 }} value={form.flash_hours} onChange={e => set('flash_hours', e.target.value)}>
              {[1,2,4,6,12,24].map(h => <option key={h} value={h}>Ends in {h} hour{h>1?'s':''}</option>)}
            </select>
          )}
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? '⏳ Posting…' : <><i className="fas fa-check" style={{ color: '#fff', fontSize: 16 }} /> Post listing — Free</>}
        </button>
      </form>
      <div style={{ height: 16 }} />
    </div>
  )
}

export default Sell
