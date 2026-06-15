import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import SignalMeter from './SignalMeter'
import LogModal from './LogModal'
import EquipmentModal from './EquipmentModal'

export default function EquipmentDetail({ item, onBack, onRefresh }) {
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchLogs() }, [item.id])

  async function fetchLogs() {
    setLoadingLogs(true)
    const { data } = await supabase
      .from('maintenance_logs')
      .select('*')
      .eq('equipment_id', item.id)
      .order('created_at', { ascending: false })
    setLogs(data || [])
    setLoadingLogs(false)
  }

  async function deleteLog(logId) {
    if (!confirm('Delete this log entry?')) return
    await supabase.from('maintenance_logs').delete().eq('id', logId)
    fetchLogs()
  }

  async function deleteEquipment() {
    if (!confirm(`Delete "${item.name}" and all its maintenance logs? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('maintenance_logs').delete().eq('equipment_id', item.id)
    await supabase.from('equipment').delete().eq('id', item.id)
    onBack()
    onRefresh()
  }

  const daysUntilMaintenance = item.next_maintenance_date
    ? Math.ceil((new Date(item.next_maintenance_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem', padding: 0 }}>
        ← Back to equipment list
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: 12, marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>{item.category}</span>
            {item.location && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>📍 {item.location}</span>}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{item.name}</h1>
          <SignalMeter status={item.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowEditModal(true)} style={btnSecStyle}>Edit</button>
          <button onClick={deleteEquipment} disabled={deleting} style={{ ...btnSecStyle, color: 'var(--red)', borderColor: 'var(--red-dim)' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
        <StatCard label="Serial number" value={item.serial_number || '—'} mono />
        <StatCard label="Purchase date" value={item.purchase_date ? formatDate(item.purchase_date) : '—'} />
        <StatCard
          label="Next maintenance"
          value={item.next_maintenance_date ? formatDate(item.next_maintenance_date) : '—'}
          accent={daysUntilMaintenance !== null && daysUntilMaintenance <= 7 ? (daysUntilMaintenance < 0 ? 'red' : 'yellow') : null}
          sub={daysUntilMaintenance !== null ? (daysUntilMaintenance < 0 ? `${Math.abs(daysUntilMaintenance)}d overdue` : daysUntilMaintenance === 0 ? 'Today' : `In ${daysUntilMaintenance}d`) : null}
        />
        <StatCard label="Log entries" value={logs.length} />
      </div>

      {item.notes && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notes</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.notes}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 500 }}>Maintenance log</h2>
        <button onClick={() => setShowLogModal(true)} style={btnAmberStyle}>+ Add log entry</button>
      </div>

      {loadingLogs ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading logs...</p>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>No maintenance logs yet</p>
          <button onClick={() => setShowLogModal(true)} style={btnAmberStyle}>Log first entry</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {logs.map(log => (
            <div key={log.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={logTypeBadge(log.log_type)}>{log.log_type}</span>
                  {log.technician_name && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {log.technician_name}</span>}
                </div>
                <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => deleteLog(log.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: 0 }} title="Delete log">✕</button>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: log.parts_replaced || log.cost || log.next_action ? 10 : 0 }}>{log.description}</p>

              {(log.parts_replaced || log.cost || log.next_action) && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  {log.parts_replaced && <Detail label="Parts replaced" value={log.parts_replaced} />}
                  {log.cost != null && <Detail label="Cost" value={`₱${parseFloat(log.cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />}
                  {log.next_action && <Detail label="Next action" value={log.next_action} />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showLogModal && (
        <LogModal
          equipment={item}
          onClose={() => setShowLogModal(false)}
          onSaved={fetchLogs}
        />
      )}
      {showEditModal && (
        <EquipmentModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { onRefresh(); onBack() }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, mono, accent, sub }) {
  const colors = { red: 'var(--red)', yellow: 'var(--yellow)' }
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 500, fontFamily: mono ? 'var(--mono)' : 'var(--font)', color: accent ? colors[accent] : 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: accent ? colors[accent] : 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{value}</p>
    </div>
  )
}

function logTypeBadge(type) {
  const colors = {
    'Repair': { bg: 'var(--red-dim)', color: 'var(--red)' },
    'Incident': { bg: 'var(--red-dim)', color: 'var(--red)' },
    'Routine check': { bg: 'var(--green-dim)', color: 'var(--green)' },
    'Inspection': { bg: 'var(--green-dim)', color: 'var(--green)' },
    'Replacement': { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
    'Calibration': { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
  }
  const c = colors[type] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)' }
  return {
    fontSize: 11, fontFamily: 'var(--mono)', padding: '2px 8px',
    borderRadius: 4, background: c.bg, color: c.color,
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

const btnSecStyle = {
  background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '7px 14px', fontSize: 13, cursor: 'pointer',
}
const btnAmberStyle = {
  background: 'var(--amber)', color: '#0D0D0D', border: 'none',
  borderRadius: 'var(--radius)', padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
}
