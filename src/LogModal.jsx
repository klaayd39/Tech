import { useState } from 'react'
import { supabase } from './supabaseClient'

const LOG_TYPES = ['Routine check', 'Repair', 'Replacement', 'Inspection', 'Calibration', 'Incident', 'Upgrade', 'Other']

export default function LogModal({ equipment, onClose, onSaved }) {
  const [form, setForm] = useState({
    log_type: 'Routine check',
    description: '',
    technician_name: '',
    parts_replaced: '',
    cost: '',
    next_action: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      equipment_id: equipment.id,
      log_type: form.log_type,
      description: form.description,
      technician_name: form.technician_name,
      parts_replaced: form.parts_replaced || null,
      cost: form.cost ? parseFloat(form.cost) : null,
      next_action: form.next_action || null,
    }

    const { error } = await supabase.from('maintenance_logs').insert([payload])
    if (error) { setError(error.message); setLoading(false); return }
    onSaved()
    onClose()
  }

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Log maintenance entry</h2>
            <p style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--mono)', marginTop: 2 }}>{equipment.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer' }} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <Field label="Log type">
            <select value={form.log_type} onChange={e => set('log_type', e.target.value)} style={inputStyle}>
              {LOG_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
              rows={3}
              placeholder="Describe what was done, observed, or fixed..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Technician name">
              <input value={form.technician_name} onChange={e => set('technician_name', e.target.value)} placeholder="Your name" style={inputStyle} />
            </Field>
            <Field label="Cost (₱)">
              <input type="number" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" min="0" step="0.01" style={inputStyle} />
            </Field>
          </div>

          <Field label="Parts replaced">
            <input value={form.parts_replaced} onChange={e => set('parts_replaced', e.target.value)} placeholder="e.g. Fuse 5A, Capacitor 100µF" style={inputStyle} />
          </Field>

          <Field label="Next recommended action">
            <input value={form.next_action} onChange={e => set('next_action', e.target.value)} placeholder="e.g. Replace belt in 3 months" style={inputStyle} />
          </Field>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, background: 'var(--red-dim)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={btnSecStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={btnPrimStyle}>
              {loading ? 'Saving...' : 'Save log entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--amber)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
}
const modalStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
  padding: '1.5rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
}
const inputStyle = {
  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
}
const btnPrimStyle = {
  background: 'var(--amber)', color: '#0D0D0D', border: 'none',
  borderRadius: 'var(--radius)', padding: '9px 20px', fontWeight: 600, fontSize: 13,
}
const btnSecStyle = {
  background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '9px 20px', fontSize: 13,
}
