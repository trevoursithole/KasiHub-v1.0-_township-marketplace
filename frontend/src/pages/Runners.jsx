import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { runnersAPI } from '../api'
import { RunnerCard, Spinner, EmptyState } from '../components/UI'
import { useToast } from '../context/ToastContext'

export default function Runners() {
  const nav = useNavigate()
  const toast = useToast()
  const [runners, setRunners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runnersAPI.getAll().then(r => { setRunners(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => nav(-1)}>
          <i className="fas fa-arrow-left" style={{ color: '#fff', fontSize: 16 }} />
          <div className="brand" style={{ fontSize: 16 }}>Runner Network</div>
        </div>
        <button className="icon-btn"><i className="fas fa-sliders-h" /></button>
      </div>

      {/* Stylised map placeholder */}
      <div style={{ height: 220, background: 'var(--night2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
        <div style={{ position: 'absolute', top: '40%', width: '100%', height: 3, background: 'rgba(255,255,255,.07)' }} />
        <div style={{ position: 'absolute', top: '65%', width: '100%', height: 3, background: 'rgba(255,255,255,.07)' }} />
        <div style={{ position: 'absolute', left: '30%', height: '100%', width: 3, background: 'rgba(255,255,255,.07)' }} />
        <div style={{ position: 'absolute', left: '60%', height: '100%', width: 3, background: 'rgba(255,255,255,.07)' }} />
        {/* Runner dots */}
        {[['18%','32%','🚴'], ['45%','55%','🚴'], ['68%','28%','🏃'], ['72%','62%','🏃']].map(([l,t,e],i) => (
          <div key={i} style={{ position:'absolute', left:l, top:t, width:28, height:28, borderRadius:'50%', background:'var(--green)', border:'2.5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, animation:`float${i} 3s ease-in-out infinite` }}>{e}</div>
        ))}
        <div style={{ position:'absolute', left:'50%', top:'44%', width:18, height:18, borderRadius:'50%', background:'var(--ochre)', border:'2.5px solid #fff', boxShadow:'0 0 0 6px rgba(200,101,26,.2)' }} />
        <div style={{ position:'absolute', left:'47%', top:'36%', background:'var(--ochre)', color:'#fff', fontSize:9, fontWeight:700, fontFamily:'Syne', padding:'2px 7px', borderRadius:8 }}>YOU</div>
        <div style={{ position:'absolute', bottom:12, left:0, right:0, display:'flex', justifyContent:'center' }}>
          <div style={{ background:'rgba(0,0,0,.5)', borderRadius:20, padding:'4px 14px', fontSize:11, color:'rgba(255,255,255,.7)' }}>Live map — Block L & Ext 4</div>
        </div>
      </div>
      <style>{`@keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>

      <div style={{ background: 'var(--night)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, color: '#fff', display:'flex', alignItems:'center', gap:6 }}><span className="live-dot" />{runners.length} runners active</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Block L & Ext 4 · Now</div>
        </div>
        <div style={{ background: 'var(--gold)', borderRadius: 8, padding: '4px 12px', fontFamily: 'Syne', fontSize: 12, fontWeight: 700, color: 'var(--night)' }}>Avg 12 min</div>
      </div>

      <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: 'var(--text)', padding: '16px 20px 10px' }}>Available runners near you</div>
      <div style={{ padding: '0 20px 16px' }}>
        {loading ? <Spinner /> : runners.length === 0 ? <EmptyState emoji="🏃" message="No runners online right now.\nCheck back soon!" /> :
          runners.map(r => <RunnerCard key={r.id} runner={r} onHire={() => toast('🎉', 'Runner hired!', `${r.name} is on their way`)} />)}
      </div>
      {runners.length > 0 && (
        <div style={{ margin: '0 20px 20px', height: 50, background: 'var(--green)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => toast('🚴', 'Runner booked!', `${runners[0]?.name} is on their way to the seller`)}>
          <i className="fas fa-bicycle" style={{ color: '#fff', fontSize: 18 }} />
          <span style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, color: '#fff' }}>Hire Nearest Runner — R{runners[0]?.rate}</span>
        </div>
      )}
    </div>
  )
}
