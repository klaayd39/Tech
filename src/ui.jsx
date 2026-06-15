// Shared UI components used across all modules

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:600, marginBottom:2 }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--text-secondary)', fontSize:13 }}>{subtitle}</p>}
      </div>
      {action}
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
    <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius)', padding:'12px 14px' }}>
      <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:22, fontWeight:600, fontFamily:'var(--mono)', color: color||'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{sub}</p>}
    </div>
  )
}

export function Badge({ label, color='var(--text-secondary)', bg='var(--bg-elevated)' }) {
  return (
    <span style={{ fontSize:11, fontFamily:'var(--mono)', padding:'2px 8px', borderRadius:4, background:bg, color, whiteSpace:'nowrap' }}>
      {label}
    </span>
  )
}

export function BtnPrimary({ children, onClick, disabled, type='button', style={} }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ background:'var(--amber)', color:'#0D0D0D', border:'none', borderRadius:'var(--radius)', padding:'8px 16px', fontWeight:600, fontSize:13, cursor:'pointer', opacity: disabled?0.6:1, ...style }}>
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
      <label style={{ display:'block', fontSize:11, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>
        {label}{required && <span style={{ color:'var(--amber)', marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function Modal({ title, subtitle, onClose, children, maxWidth=520 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.5rem', width:'100%', maxWidth, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:600 }}>{title}</h2>
            {subtitle && <p style={{ fontSize:12, color:'var(--amber)', fontFamily:'var(--mono)', marginTop:2 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-secondary)', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ message, action, onAction }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 1rem', border:'1px dashed var(--border)', borderRadius:'var(--radius-lg)' }}>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom: action?12:0 }}>{message}</p>
      {action && <BtnPrimary onClick={onAction}>{action}</BtnPrimary>}
    </div>
  )
}

export function ErrorMsg({ msg }) {
  if (!msg) return null
  return <p style={{ color:'var(--red)', fontSize:13, background:'var(--red-dim)', padding:'8px 12px', borderRadius:'var(--radius)' }}>{msg}</p>
}

export function SuccessMsg({ msg }) {
  if (!msg) return null
  return <p style={{ color:'var(--green)', fontSize:13, background:'var(--green-dim)', padding:'8px 12px', borderRadius:'var(--radius)' }}>{msg}</p>
}

export function Grid({ cols=2, children, gap=12 }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  )
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
  const diff = Math.floor((Date.now() - new Date(d)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}
