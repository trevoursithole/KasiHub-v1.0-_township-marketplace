import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { zonesAPI } from '../api'
import { ZoneCard, Spinner, EmptyState } from '../components/UI'

export default function Zones() {
  const nav = useNavigate()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    zonesAPI.getAll()
      .then(r => { setZones(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => nav(-1)}>
          <i className="fas fa-arrow-left" style={{ color: '#fff', fontSize: 16 }} />
          <div className="brand" style={{ fontSize: 16 }}>Safe-Trade Zones</div>
        </div>
        <button className="icon-btn"><i className="fas fa-search" /></button>
      </div>

      {/* Map placeholder */}
      <div style={{ height: 200, background: 'var(--night2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
        <div style={{ position: 'absolute', top: '45%', width: '100%', height: 3, background: 'rgba(255,255,255,.07)' }} />
        <div style={{ position: 'absolute', top: '70%', width: '100%', height: 3, background: 'rgba(255,255,255,.07)' }} />
        <div style={{ position: 'absolute', left: '35%', height: '100%', width: 3, background: 'rgba(255,255,255,.07)' }} />
        <div style={{ position: 'absolute', left: '65%', height: '100%', width: 3, background: 'rgba(255,255,255,.07)' }} />
        {[['25%','30%','⛽','Engen'],['55%','60%','🏬','Mall'],['72%','42%','🚔','Police']].map(([l,t,e,label]) => (
          <div key={label}>
            <div style={{ position:'absolute', left:l, top:t, width:32, height:32, borderRadius:'50%', background:'var(--gold)', border:'2.5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{e}</div>
            <div style={{ position:'absolute', left:l, top:`calc(${t} + 36px)`, fontSize:9, color:'var(--gold)', fontFamily:'Syne', fontWeight:700, transform:'translateX(-30%)' }}>{label}</div>
          </div>
        ))}
        <div style={{ position:'absolute', left:'50%', top:'50%', width:18, height:18, borderRadius:'50%', background:'var(--ochre)', border:'2.5px solid #fff', boxShadow:'0 0 0 6px rgba(200,101,26,.2)', transform:'translate(-50%,-50%)' }} />
        <div style={{ position:'absolute', left:'51%', top:'38%', background:'var(--ochre)', color:'#fff', fontSize:9, fontWeight:700, fontFamily:'Syne', padding:'2px 7px', borderRadius:8 }}>YOU</div>
        <div style={{ position:'absolute', bottom:12, left:0, right:0, display:'flex', justifyContent:'center' }}>
          <div style={{ background:'rgba(0,0,0,.5)', borderRadius:20, padding:'4px 14px', fontSize:11, color:'rgba(255,255,255,.7)' }}>Tap a pin for directions</div>
        </div>
      </div>

      <div style={{ background: 'var(--night2)', padding: '10px 20px 14px' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>
          Safe-Trade Zones are vetted, high-traffic public locations where you should meet for exchanges. All zones have security presence or CCTV coverage.
        </div>
      </div>

      <div style={{ padding: '14px 20px 20px' }}>
        {loading
          ? <Spinner />
          : zones.length === 0
            ? <EmptyState emoji="📍" message="No zones listed in your area yet." />
            : zones.map(z => <ZoneCard key={z.id} zone={z} />)
        }
      </div>
    </div>
  )
}
