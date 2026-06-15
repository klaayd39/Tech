import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const CATEGORIES = ['Transmitter', 'Mixer / Console', 'Microphone', 'Computer / Server', 'Network / Router', 'Antenna', 'Power Supply / UPS', 'Recorder / Playback', 'Monitor / Speaker', 'Other']
const STATUSES = ['operational', 'maintenance', 'faulty', 'decommissioned']

export default function EquipmentModal({ item, onClose, onSaved }) {
  const isEdit = !!item

  const [form, setForm] = useState({
    name: '',
    category: 'Transmitter',
    serial_number: '',
    location: '',
    status: 'operational',
    purchase_date: '',
    next_maintenance_date: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        category: item.category || 'Transmitter',
        serial_number: item.serial_number || '',
        location: item.location || '',
        status: item.status || 'operational',
        purchase_date: item.purchase_date || '',
        next_maintenance_date: item.next_maintenance_date || '',
        notes: item.notes || '',
      })
    }
  }, [item])

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = { ...form }
    if (!payload.purchase_date) delete payload.purchase_date
    if (!payload.next_maintenance_date) delete payload.next_maintenance_date

    let error
    if (isEdit) {
      ({ error } = await supabase.from('equipment').update(payload).eq('id', item.id))
    } else {
      ({ error } = await supabase.from('equipment').insert([payload]))
    }

    if (error) { setError(error.message); setLoading(false); return }
    onSaved()
    onClose()
  }

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{isEdit ? 'Edit equipment' : 'Add equipment'}</h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Equipment name" required>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Main Transmitter" style={inputStyle} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Serial number">
              <input value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="e.g. SN-20198-XZ" style={inputStyle} />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Studio A, Rack 2" style={inputStyle} />
            </Field>
          </div>

          <Field label="Status">
            <div style={{ display: 'flex', gap: 8 }}>
              {STATUSES.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => set('status', s)}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${form.status === s ? statusColor(s) : 'var(--border)'}`,
                    background: form.status === s ? `${statusColor(s)}22` : 'var(--bg-input)',
                    color: form.status === s ? statusColor(s) : 'var(--text-secondary)',
                    fontSize: 11,
                    fontFamily: 'var(--mono)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Purchase date">
              <input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Next maintenance date">
              <input type="date" value={form.next_maintenance_date} onChange={e => set('next_maintenance_date', e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Manufacturer, model details, special instructions..." style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, background: 'var(--red-dim)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={btnSecStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={btnPrimStyle}>
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Add equipment'}
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

function statusColor(s) {
  return { operational: '#4CAF50', maintenance: '#FFC107', faulty: '#E53935', decommissioned: '#666' }[s]
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
}
const modalStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
  padding: '1.5rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
}
const inputStyle = {
  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
}
const iconBtnStyle = {
  background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1,
}
const btnPrimStyle = {
  background: 'var(--amber)', color: '#0D0D0D', border: 'none',
  borderRadius: 'var(--radius)', padding: '9px 20px', fontWeight: 600, fontSize: 13,
}
const btnSecStyle = {
  background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '9px 20px', fontSize: 13,
}
