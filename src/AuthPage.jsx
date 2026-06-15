import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError(''); setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ textAlign:'center' }}>
        <TribalSun />
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--gold-light)', marginTop:12, marginBottom:4 }}>Bombo Radyo</h1>
        <p style={{ fontFamily:'var(--font-display)', fontSize:16, color:'var(--text-secondary)', fontStyle:'italic' }}>TechOps Suite</p>
        <div style={{ marginTop:10, display:'flex', justifyContent:'center', gap:3 }}>
          {['var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)','var(--red)','var(--green)','var(--gold)'].map((c,i) => (
            <div key={i} style={{ width:18, height:3, background:c, borderRadius:1, opacity:0.8 }} />
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8, letterSpacing:1, textTransform:'uppercase' }}>Malaybalay City, Bukidnon</p>
      </div>

      {/* Card */}
      <div style={{ width:'100%', maxWidth:380, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div className="tribal-divider" />
        <div style={{ padding:'1.75rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--text)', marginBottom:'1.25rem' }}>
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@bomboradyo.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>

            {error && <p style={{ color:'var(--red-light)', fontSize:13, background:'var(--red-dim)', padding:'8px 12px', borderRadius:'var(--radius)' }}>{error}</p>}
            {message && <p style={{ color:'var(--green-light)', fontSize:13, background:'var(--green-dim)', padding:'8px 12px', borderRadius:'var(--radius)' }}>{message}</p>}

            <button type="submit" disabled={loading} style={{ background:'var(--gold)', color:'#1A1008', border:'none', borderRadius:'var(--radius)', padding:'10px', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'var(--font-display)', marginTop:4 }}>
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1rem', fontSize:13, color:'var(--text-muted)' }}>
            {isLogin ? 'No account? ' : 'Have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage('') }} style={{ background:'none', border:'none', color:'var(--gold-light)', cursor:'pointer', fontSize:13 }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        <div className="tribal-divider" />
      </div>

      <p style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:0.5 }}>Kaamulan • Unity in Diversity • Bukidnon</p>
    </div>
  )
}

function TribalSun() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin:'0 auto', display:'block' }}>
      <circle cx="32" cy="32" r="12" fill="none" stroke="#C8922A" strokeWidth="2"/>
      <circle cx="32" cy="32" r="6" fill="#C8922A"/>
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const r1 = 15, r2 = 24
        const rad = angle * Math.PI / 180
        const x1 = 32 + r1*Math.cos(rad), y1 = 32 + r1*Math.sin(rad)
        const x2 = 32 + r2*Math.cos(rad), y2 = 32 + r2*Math.sin(rad)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i%2===0?'#C8922A':'#C0392B'} strokeWidth="2" strokeLinecap="round"/>
      })}
      {[0,90,180,270].map((angle,i) => {
        const rad = angle * Math.PI / 180
        const x = 32 + 28*Math.cos(rad), y = 32 + 28*Math.sin(rad)
        return <rect key={i} x={x-3} y={y-3} width="6" height="6" fill="#4A7C59" transform={`rotate(45 ${x} ${y})`}/>
      })}
    </svg>
  )
}

const labelStyle = { display:'block', fontSize:11, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }
const inputStyle = { width:'100%', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'9px 12px', color:'var(--text)', fontSize:13, outline:'none' }
