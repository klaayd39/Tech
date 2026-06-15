export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom:'1.75rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:10 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'var(--gold-light)', marginBottom:2 }}>{title}</h1>
          {subtitle && <p style={{ color:'var(--text-muted)', fontSize:13 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {/* tribal rule */}
      <div style={{ display:'flex', gap:3 }}>
        {['var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)'].map((c,i) => (
          <div key={i} style={{ flex:1, height:2, background:c, opacity:0.5, borderRadius:1 }} />
        ))}
      </div>
    </div>
  )
}

export function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 16px', ...style }}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius)', padding:'14px', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: color||'var(--gold)', opacity:0.6 }} />
      <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:24, fontWeight:700, fontFamily:'var(--font-display)', color: color||'var(--gold-light)' }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{sub}</p>}
    </div>
  )
}

export function Badge({ label, color='var(--text-secondary)', bg='var(--bg-elevated)' }) {
  return (
    <span style={{ fontSize:11, fontFamily:'var(--mono)', padding:'2px 8px', borderRadius:3, background:bg, color, whiteSpace:'nowrap', border:`1px solid ${color}33` }}>
      {label}
    </span>
  )
}

export function BtnPrimary({ children, onClick, disabled, type='button', style={} }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ background:'var(--gold)', color:'#1A1008', border:'none', borderRadius:'var(--radius)', padding:'8px 16px', fontWeight:600, fontSize:13, cursor:'pointer', opacity:disabled?0.6:1, fontFamily:'var(--font)', ...style }}>
      {children}
    </button>
  )
}

export function BtnSecondary({ children, onClick, style={} }) {
  return (
    <button onClick={onClick}
      style={{ background:'none', color:'var(--text-secondary)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'8px 14px', fontSize:13, cursor:'pointer', ...style }}>
      {children}
    </button>
  )
}

export function Input({ value, onChange, placeholder, type='text', style={}, ...rest }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width:'100%', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'9px 12px', color:'var(--text)', fontSize:13, outline:'none', ...style }}
      {...rest} />
  )
}

export function Select({ value, onChange, children, style={} }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width:'100%', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'9px 12px', color:'var(--text)', fontSize:13, outline:'none', ...style }}>
      {children}
    </select>
  )
}

export function Textarea({ value, onChange, placeholder, rows=3, style={} }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ width:'100%', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'9px 12px', color:'var(--text)', fontSize:13, outline:'none', resize:'vertical', ...style }} />
  )
}

export function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:11, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>
        {label}{required && <span style={{ color:'var(--gold)', marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function Modal({ title, subtitle, onClose, children, maxWidth=520 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,6,2,0.85)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth, maxHeight:'90vh', overflowY:'auto', overflow:'hidden' }}>
        <div className="tribal-divider" />
        <div style={{ padding:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--gold-light)' }}>{title}</h2>
              {subtitle && <p style={{ fontSize:12, color:'var(--gold)', fontFamily:'var(--mono)', marginTop:2 }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer' }}>✕</button>
          </div>
          {children}
        </div>
        <div className="tribal-divider" />
      </div>
    </div>
  )
}

export function EmptyState({ message, action, onAction }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 1rem', border:'1px dashed var(--border)', borderRadius:'var(--radius-lg)', background:'var(--bg-elevated)' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>🌿</div>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:action?14:0 }}>{message}</p>
      {action && <BtnPrimary onClick={onAction}>{action}</BtnPrimary>}
    </div>
  )
}

export function ErrorMsg({ msg }) {
  if (!msg) return null
  return <p style={{ color:'var(--red-light)', fontSize:13, background:'var(--red-dim)', padding:'8px 12px', borderRadius:'var(--radius)', border:'1px solid var(--red-dim)' }}>{msg}</p>
}

export function SuccessMsg({ msg }) {
  if (!msg) return null
  return <p style={{ color:'var(--green-light)', fontSize:13, background:'var(--green-dim)', padding:'8px 12px', borderRadius:'var(--radius)' }}>{msg}</p>
}

export function Grid({ cols=2, children, gap=12 }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap }}>{children}</div>
}

export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })
}

export function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-PH', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export function timeAgo(d) {
  const diff = Math.floor((Date.now()-new Date(d))/1000)
  if (diff<60) return 'just now'
  if (diff<3600) return `${Math.floor(diff/60)}m ago`
  if (diff<86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}
