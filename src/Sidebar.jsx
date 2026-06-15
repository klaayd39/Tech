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
      width:'var(--sidebar-w)', background:'var(--bg-card)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', height:'100vh',
      position:'fixed', left:0, top:0, zIndex:50,
    }}>
      {/* Tribal top bar */}
      <div className="tribal-divider" />

      {/* Logo */}
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <KaamulanIcon />
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:13, color:'var(--gold-light)', fontWeight:600, letterSpacing:0.5 }}>Bombo Radyo</p>
            <p style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:1, textTransform:'uppercase' }}>TechOps Suite</p>
          </div>
        </div>
        {/* Mini tribal pattern */}
        <div style={{ marginTop:10, display:'flex', gap:3 }}>
          {['var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)'].map((c,i) => (
            <div key={i} style={{ flex:1, height:3, background:c, borderRadius:1, opacity:0.7 }} />
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        <p style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1.5, padding:'8px 10px 6px', fontWeight:500 }}>Modules</p>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'9px 12px', borderRadius:'var(--radius)', marginBottom:2,
              background: active===item.id ? 'var(--gold-glow)' : 'none',
              border: active===item.id ? '1px solid var(--gold-dim)' : '1px solid transparent',
              color: active===item.id ? 'var(--gold-light)' : 'var(--text-secondary)',
              fontSize:13, textAlign:'left', cursor:'pointer', transition:'all 0.15s',
            }}
            onMouseEnter={e => { if(active!==item.id) e.currentTarget.style.color='var(--text)' }}
            onMouseLeave={e => { if(active!==item.id) e.currentTarget.style.color='var(--text-secondary)' }}
          >
            <span style={{ fontSize:14 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom tribal + user */}
      <div>
        <div style={{ margin:'0 12px', display:'flex', gap:3, marginBottom:10 }}>
          {['var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)'].map((c,i) => (
            <div key={i} style={{ flex:1, height:3, background:c, borderRadius:1, opacity:0.7 }} />
          ))}
        </div>
        <div style={{ padding:'10px 12px 14px', borderTop:'1px solid var(--border)' }}>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</p>
          <button onClick={onSignOut} style={{ width:'100%', background:'none', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius)', padding:'6px', fontSize:12, cursor:'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}

function KaamulanIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {/* Tribal diamond / sun motif */}
      <rect x="14" y="2" width="4" height="4" fill="#C8922A" transform="rotate(45 16 4)" />
      <rect x="14" y="26" width="4" height="4" fill="#C8922A" transform="rotate(45 16 28)" />
      <rect x="2" y="14" width="4" height="4" fill="#C0392B" transform="rotate(45 4 16)" />
      <rect x="26" y="14" width="4" height="4" fill="#C0392B" transform="rotate(45 28 16)" />
      <circle cx="16" cy="16" r="5" fill="none" stroke="#C8922A" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="2.5" fill="#C8922A"/>
      <line x1="16" y1="8" x2="16" y2="11" stroke="#4A7C59" strokeWidth="1.5"/>
      <line x1="16" y1="21" x2="16" y2="24" stroke="#4A7C59" strokeWidth="1.5"/>
      <line x1="8" y1="16" x2="11" y2="16" stroke="#4A7C59" strokeWidth="1.5"/>
      <line x1="21" y1="16" x2="24" y2="16" stroke="#4A7C59" strokeWidth="1.5"/>
    </svg>
  )
}
