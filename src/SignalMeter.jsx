export default function SignalMeter({ status }) {
  const levels = {
    operational:    { bars:4, color:'#4A7C59', label:'Operational' },
    maintenance:    { bars:2, color:'#D4A017', label:'Maintenance' },
    faulty:         { bars:1, color:'#C0392B', label:'Faulty' },
    decommissioned: { bars:0, color:'#6B5030', label:'Decommissioned' },
  }
  const config = levels[status] || levels.operational
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:16 }}>
        {Array.from({ length:4 }).map((_,i) => (
          <div key={i} style={{ width:4, height:6+i*3, borderRadius:1, background: i<config.bars ? config.color : 'var(--border)', transition:'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontFamily:'var(--mono)', fontSize:11, color:config.color, letterSpacing:0.5 }}>{config.label}</span>
    </div>
  )
}
