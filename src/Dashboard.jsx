import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import SignalMeter from './SignalMeter'
import EquipmentModal from './EquipmentModal'
import EquipmentDetail from './EquipmentDetail'

const STATUS_FILTERS = ['all', 'operational', 'maintenance', 'faulty', 'decommissioned']

export default function Dashboard({ user, onSignOut }) {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchEquipment() }, [])

  async function fetchEquipment() {
    setLoading(true)
    const { data } = await supabase.from('equipment').select('*').order('created_at', { ascending: false })
    setEquipment(data || [])
    setLoading(false)
  }

  const filtered = equipment.filter(e => {
    const matchStatus = filter === 'all' || e.status === filter
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.serial_number || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    faulty: equipment.filter(e => e.status === 'faulty').length,
  }

  const overdue = equipment.filter(e => {
    if (!e.next_maintenance_date) return false
    return new Date(e.next_maintenance_date) < new Date()
  })

  if (selectedItem) {
    return (
      <div style={mainStyle}>
        <TopBar user={user} onSignOut={onSignOut} />
        <div style={contentStyle}>
          <EquipmentDetail
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onRefresh={fetchEquipment}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={mainStyle}>
      <TopBar user={user} onSignOut={onSignOut} />
      <div style={contentStyle}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Equipment inventory</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Bombo Radyo Malaybalay — IT & Technician</p>
          </div>
          <button onClick={() => setShowModal(true)} style={btnAmberStyle}>+ Add equipment</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
          <SummaryCard label="Total equipment" value={counts.total} />
          <SummaryCard label="Operational" value={counts.operational} color="var(--green)" />
          <SummaryCard label="In maintenance" value={counts.maintenance} color="var(--yellow)" />
          <SummaryCard label="Faulty" value={counts.faulty} color="var(--red)" />
          <SummaryCard label="Overdue service" value={overdue.length} color={overdue.length > 0 ? 'var(--red)' : undefined} />
        </div>

        {overdue.length > 0 && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500 }}>⚠ {overdue.length} equipment overdue for maintenance:</span>
            <span style={{ color: 'var(--red)', fontSize: 13 }}>{overdue.map(e => e.name).join(', ')}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category, location, serial..."
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 12px', borderRadius: 'var(--radius)', fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${filter === f ? 'var(--amber)' : 'var(--border)'}`,
                  background: filter === f ? 'var(--amber-glow)' : 'transparent',
                  color: filter === f ? 'var(--amber)' : 'var(--text-secondary)',
                  fontFamily: 'var(--mono)', textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading equipment...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{search || filter !== 'all' ? 'No equipment matches your search.' : 'No equipment added yet.'}</p>
            {!search && filter === 'all' && (
              <button onClick={() => setShowModal(true)} style={btnAmberStyle}>Add your first equipment</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map(item => (
              <EquipmentCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EquipmentModal
          onClose={() => setShowModal(false)}
          onSaved={fetchEquipment}
        />
      )}
    </div>
  )
}

function EquipmentCard({ item, onClick }) {
  const daysUntilMaintenance = item.next_maintenance_date
    ? Math.ceil((new Date(item.next_maintenance_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{item.name}</h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--mono)' }}>{item.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <SignalMeter status={item.status} />
          {item.location && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {item.location}</span>}
          {item.serial_number && <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{item.serial_number}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {daysUntilMaintenance !== null && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Next maintenance</p>
            <p style={{
              fontSize: 12, fontFamily: 'var(--mono)',
              color: daysUntilMaintenance < 0 ? 'var(--red)' : daysUntilMaintenance <= 7 ? 'var(--yellow)' : 'var(--text-secondary)',
            }}>
              {daysUntilMaintenance < 0 ? `${Math.abs(daysUntilMaintenance)}d overdue` : daysUntilMaintenance === 0 ? 'Today' : `${daysUntilMaintenance}d`}
            </p>
          </div>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 600, color: color || 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</p>
    </div>
  )
}

function TopBar({ user, onSignOut }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SignalLogo />
        <div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)', letterSpacing: 1 }}>BOMBO RADYO</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Equipment Tracker</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</span>
        <button onClick={onSignOut} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius)', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Sign out</button>
      </div>
    </div>
  )
}

function SignalLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="14" width="3" height="5" rx="1" fill="#F5A623"/>
      <rect x="6" y="10" width="3" height="9" rx="1" fill="#F5A623" opacity="0.8"/>
      <rect x="11" y="6" width="3" height="13" rx="1" fill="#F5A623" opacity="0.6"/>
      <rect x="16" y="2" width="3" height="17" rx="1" fill="#F5A623" opacity="0.4"/>
    </svg>
  )
}

const mainStyle = { minHeight: '100vh', display: 'flex', flexDirection: 'column' }
const contentStyle = { flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '1.5rem 1rem' }
const inputStyle = {
  background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
}
const btnAmberStyle = {
  background: 'var(--amber)', color: '#0D0D0D', border: 'none',
  borderRadius: 'var(--radius)', padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
}
