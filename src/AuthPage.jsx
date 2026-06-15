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
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <SignalIcon />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--amber)', letterSpacing: 2, textTransform: 'uppercase' }}>Bombo Radyo</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Equipment Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>IT & Technician Dashboard</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: '1.25rem', color: 'var(--text)' }}>
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@bomboradyo.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, background: 'var(--red-dim)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{error}</p>}
            {message && <p style={{ color: 'var(--green)', fontSize: 13, marginBottom: 12, background: 'var(--green-dim)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{message}</p>}

            <button type="submit" disabled={loading} style={btnPrimaryStyle}>
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--text-secondary)' }}>
            {isLogin ? "No account? " : "Have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage('') }} style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: 13 }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function SignalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="14" width="3" height="5" rx="1" fill="#F5A623" opacity="1"/>
      <rect x="6" y="10" width="3" height="9" rx="1" fill="#F5A623" opacity="0.8"/>
      <rect x="11" y="6" width="3" height="13" rx="1" fill="#F5A623" opacity="0.6"/>
      <rect x="16" y="2" width="3" height="17" rx="1" fill="#F5A623" opacity="0.4"/>
    </svg>
  )
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
}

const btnPrimaryStyle = {
  width: '100%',
  background: 'var(--amber)',
  color: '#0D0D0D',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '10px',
  fontWeight: 600,
  fontSize: 14,
}
