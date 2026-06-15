import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PageHeader, Card, Badge, BtnPrimary, BtnSecondary, Field, Input, Select, Textarea, Modal, EmptyState, ErrorMsg, StatCard, formatDate, formatDateTime } from '../ui.jsx'

const TYPES = ['Equipment failure','Signal loss','Power outage','Network issue','Software error','Security incident','Flood/Fire/Physical','Other']
const SEVERITIES = ['Low','Medium','High','Critical']
const STATUSES = ['open','investigating','resolved','closed']

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchIncidents() }, [])

  async function fetchIncidents() {
    setLoading(true)
    const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false })
    setIncidents(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const update = { status }
    if (status === 'resolved') update.resolved_at = new Date().toISOString()
    await supabase.from('incidents').update(update).eq('id', id)
    fetchIncidents()
  }

  async function deleteIncident(id) {
    if (!confirm('Delete this incident?')) return
    await supabase.from('incidents').delete().eq('id', id)
    fetchIncidents()
  }

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter)
  const open = incidents.filter(i => i.status === 'open').length
  const investigating = incidents.filter(i => i.status === 'investigating').length
  const critical = incidents.filter(i => i.severity === 'Critical' && i.status !== 'closed').length

  return (
    <div>
      <PageHeader title="Incident Tracker" subtitle="Log and track all technical incidents" action={<BtnPrimary onClick={() => { setEditing(null); setShowModal(true) }}>+ Log incident</BtnPrimary>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:'1.5rem' }}>
        <StatCard label="Total" value={incidents.length} />
        <StatCard label="Open" value={open} color={open>0?'var(--red)':undefined} />
        <StatCard label="Investigating" value={investigating} color={investigating>0?'var(--yellow)':undefined} />
        <StatCard label="Critical active" value={critical} color={critical>0?'var(--red)':undefined} />
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:'1rem', flexWrap:'wrap' }}>
        {['all','open','investigating','resolved','closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 12px', borderRadius:'var(--radius)', fontSize:12, cursor:'pointer',
            border:`1px solid ${filter===f?'var(--amber)':'var(--border)'}`,
            background: filter===f?'var(--amber-glow)':'transparent',
            color: filter===f?'var(--amber)':'var(--text-secondary)',
            fontFamily:'var(--mono)',
          }}>{f}</button>
        ))}
      </div>

      {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
        : filtered.length === 0 ? <EmptyState message="No incidents found." action={filter==='all'?'Log first incident':null} onAction={() => setShowModal(true)} />
        : (
          <div style={{ display:'grid', gap:10 }}>
            {filtered.map(inc => (
              <Card key={inc.id} style={{ borderLeft: inc.severity==='Critical'?'3px solid var(--red)': inc.severity==='High'?'3px solid var(--yellow)':'1px solid var(--border)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:14, fontWeight:500 }}>{inc.title}</h3>
                      <SeverityBadge s={inc.severity} />
                      <StatusBadge s={inc.status} />
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>
                      🏷 {inc.incident_type} · 📅 {formatDateTime(inc.created_at)}
                      {inc.resolved_at && <> · ✅ Resolved {formatDateTime(inc.resolved_at)}</>}
                    </p>
                    {inc.description && <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>{inc.description}</p>}
                    {inc.affected_equipment && <p style={{ fontSize:12, color:'var(--text-muted)' }}>📡 Affected: {inc.affected_equipment}</p>}
                    {inc.resolution && <p style={{ fontSize:12, color:'var(--green)', marginTop:6, background:'var(--green-dim)', padding:'6px 10px', borderRadius:'var(--radius)' }}>✅ Resolution: {inc.resolution}</p>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <BtnSecondary onClick={() => { setEditing(inc); setShowModal(true) }} style={{ padding:'5px 10px', fontSize:12 }}>Edit</BtnSecondary>
                      <button onClick={() => deleteIncident(inc.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:13 }}>✕</button>
                    </div>
                    <select value={inc.status} onChange={e => updateStatus(inc.id, e.target.value)}
                      style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius)', padding:'4px 8px', fontSize:12, cursor:'pointer', fontFamily:'var(--mono)' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {showModal && <IncidentModal incident={editing} onClose={() => setShowModal(false)} onSaved={fetchIncidents} />}
    </div>
  )
}

function IncidentModal({ incident, onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', incident_type:'Equipment failure', severity:'Medium', description:'', affected_equipment:'', reported_by:'', resolution:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    if (incident) setForm({ title:incident.title||'', incident_type:incident.incident_type||'Equipment failure', severity:incident.severity||'Medium', description:incident.description||'', affected_equipment:incident.affected_equipment||'', reported_by:incident.reported_by||'', resolution:incident.resolution||'' })
  }, [incident])

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = incident
      ? await supabase.from('incidents').update(form).eq('id', incident.id)
      : await supabase.from('incidents').insert([{ ...form, status:'open' }])
    if (error) { setError(error.message); setLoading(false); return }
    onSaved(); onClose()
  }

  return (
    <Modal title={incident ? 'Edit incident' : 'Log incident'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:14 }}>
        <Field label="Incident title" required><Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Main transmitter overheating" required /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Type">
            <Select value={form.incident_type} onChange={e=>set('incident_type',e.target.value)}>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Severity">
            <Select value={form.severity} onChange={e=>set('severity',e.target.value)}>
              {SEVERITIES.map(s=><option key={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Affected equipment / area"><Input value={form.affected_equipment} onChange={e=>set('affected_equipment',e.target.value)} placeholder="e.g. Studio A transmitter, Studio B mixer" /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What happened? When? What was the impact?" /></Field>
        <Field label="Reported by"><Input value={form.reported_by} onChange={e=>set('reported_by',e.target.value)} placeholder="Your name" /></Field>
        <Field label="Resolution (fill in when resolved)"><Textarea value={form.resolution} onChange={e=>set('resolution',e.target.value)} placeholder="What was done to fix it?" rows={2} /></Field>
        <ErrorMsg msg={error} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary type="submit" disabled={loading}>{loading?'Saving...':incident?'Save changes':'Log incident'}</BtnPrimary>
        </div>
      </form>
    </Modal>
  )
}

function SeverityBadge({ s }) {
  const c = { Low:'var(--text-muted)', Medium:'var(--blue)', High:'var(--yellow)', Critical:'var(--red)' }
  const bg = { Low:'var(--bg-elevated)', Medium:'var(--blue-dim)', High:'var(--yellow-dim)', Critical:'var(--red-dim)' }
  return <Badge label={s} color={c[s]} bg={bg[s]} />
}

function StatusBadge({ s }) {
  const c = { open:'var(--red)', investigating:'var(--yellow)', resolved:'var(--green)', closed:'var(--text-muted)' }
  const bg = { open:'var(--red-dim)', investigating:'var(--yellow-dim)', resolved:'var(--green-dim)', closed:'var(--bg-elevated)' }
  return <Badge label={s} color={c[s]} bg={bg[s]} />
}
