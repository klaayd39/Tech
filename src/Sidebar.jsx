const NAV = [
  { id:'equipment',  label:'Equipment Inventory',   icon:'📡' },
  { id:'scheduler',  label:'Maintenance Scheduler',  icon:'🗓' },
  { id:'incidents',  label:'Incident Tracker',       icon:'⚠️' },
  { id:'logbook',    label:'Daily Logbook',          icon:'📋' },
  { id:'helpdesk',   label:'IT Helpdesk',            icon:'🎧' },
  { id:'outages',    label:'Outage Reports',         icon:'🔴' },
]

export default function Sidebar({ active, onChange, user, onSignOut }) {
  return (
    <aside style={{
      width:'var(--sidebar-w)', background:'var(--bg-card)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', height:'100vh', position:'fixed', left:0, top:0, zIndex:50,
    }}>
      {/* Logo */}
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
          <SignalLogo />
          <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--amber)', letterSpacing:1, fontWeight:500 }}>BOMBO RADYO</span>
        </div>
        <p style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:0.5, paddingLeft:26 }}>TechOps Suite</p>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'9px 10px', borderRadius:'var(--radius)', marginBottom:2,
              background: active===item.id ? 'var(--amber-glow)' : 'none',
              border: active===item.id ? '1px solid var(--amber-dim)' : '1px solid transparent',
              color: active===item.id ? 'var(--amber)' : 'var(--text-secondary)',
              fontSize:13, textAlign:'left', cursor:'pointer', transition:'all 0.15s',
            }}
          >
            <span style={{ fontSize:15, lineHeight:1 }}>{item.icon}</span>
            <span style={{ fontSize:12.5 }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding:'12px 12px', borderTop:'1px solid var(--border)' }}>
        <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</p>
        <button onClick={onSignOut} style={{ width:'100%', background:'none', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius)', padding:'6px', fontSize:12, cursor:'pointer' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

function SignalLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="14" width="3" height="5" rx="1" fill="#F5A623"/>
      <rect x="6" y="10" width="3" height="9" rx="1" fill="#F5A623" opacity="0.8"/>
      <rect x="11" y="6" width="3" height="13" rx="1" fill="#F5A623" opacity="0.6"/>
      <rect x="16" y="2" width="3" height="17" rx="1" fill="#F5A623" opacity="0.4"/>
    </svg>
  )
}
