import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import SignalMeter from '../SignalMeter'
import EquipmentModal from '../EquipmentModal'
import EquipmentDetail from '../EquipmentDetail'
import { PageHeader, StatCard, EmptyState, Input, BtnPrimary } from '../ui.jsx'

const STATUS_FILTERS = ['all','operational','maintenance','faulty','decommissioned']

export default function Equipment() {
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
    const matchSearch = !search || [e.name, e.category, e.location, e.serial_number].some(f => (f||'').toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const counts = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    faulty: equipment.filter(e => e.status === 'faulty').length,
  }
  const overdue = equipment.filter(e => e.next_maintenance_date && new Date(e.next_maintenance_date) < new Date())

  if (selectedItem) return (
    <EquipmentDetail item={selectedItem} onBack={() => setSelectedItem(null)} onRefresh={fetchEquipment} />
  )

  return (
    <div>
      <PageHeader title="Equipment Inventory" subtitle="All station equipment and hardware" action={<BtnPrimary onClick={() => setShowModal(true)}>+ Add equipment</BtnPrimary>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px,1fr))', gap:10, marginBottom:'1.5rem' }}>
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Operational" value={counts.operational} color="var(--green)" />
        <StatCard label="Maintenance" value={counts.maintenance} color="var(--yellow)" />
        <StatCard label="Faulty" value={counts.faulty} color="var(--red)" />
        <StatCard label="Overdue service" value={overdue.length} color={overdue.length > 0 ? 'var(--red)' : undefined} />
      </div>

      {overdue.length > 0 && (
        <div style={{ background:'var(--red-dim)', border:'1px solid var(--red)', borderRadius:'var(--radius)', padding:'10px 14px', marginBottom:'1.5rem', fontSize:13, color:'var(--red)' }}>
          ⚠ {overdue.length} equipment overdue for maintenance: {overdue.map(e => e.name).join(', ')}
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, category, location, serial..." style={{ flex:1, minWidth:200 }} />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'7px 12px', borderRadius:'var(--radius)', fontSize:12, cursor:'pointer',
              border:`1px solid ${filter===f?'var(--amber)':'var(--border)'}`,
              background: filter===f?'var(--amber-glow)':'transparent',
              color: filter===f?'var(--amber)':'var(--text-secondary)',
              fontFamily:'var(--mono)', textTransform:'capitalize',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
        : filtered.length === 0 ? <EmptyState message={search||filter!=='all' ? 'No equipment matches your search.' : 'No equipment added yet.'} action={!search&&filter==='all'?'Add first equipment':null} onAction={() => setShowModal(true)} />
        : (
          <div style={{ display:'grid', gap:10 }}>
            {filtered.map(item => <EquipmentCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
          </div>
        )}

      {showModal && <EquipmentModal onClose={() => setShowModal(false)} onSaved={fetchEquipment} />}
    </div>
  )
}

function EquipmentCard({ item, onClick }) {
  const days = item.next_maintenance_date ? Math.ceil((new Date(item.next_maintenance_date) - new Date()) / 86400000) : null
  return (
    <div onClick={onClick} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 16px', cursor:'pointer', display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center', transition:'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <h3 style={{ fontSize:14, fontWeight:500 }}>{item.name}</h3>
          <span style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-elevated)', padding:'1px 7px', borderRadius:4, fontFamily:'var(--mono)' }}>{item.category}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <SignalMeter status={item.status} />
          {item.location && <span style={{ fontSize:12, color:'var(--text-muted)' }}>📍 {item.location}</span>}
          {item.serial_number && <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text-muted)' }}>{item.serial_number}</span>}
        </div>
      </div>
      {days !== null && (
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>Next maint.</p>
          <p style={{ fontSize:12, fontFamily:'var(--mono)', color: days<0?'var(--red)':days<=7?'var(--yellow)':'var(--text-secondary)' }}>
            {days<0?`${Math.abs(days)}d overdue`:days===0?'Today':`${days}d`}
          </p>
        </div>
      )}
    </div>
  )
}
