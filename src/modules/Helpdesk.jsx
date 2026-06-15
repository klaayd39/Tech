import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PageHeader, Card, Badge, BtnPrimary, BtnSecondary, Field, Input, Select, Textarea, Modal, EmptyState, ErrorMsg, StatCard, formatDateTime } from '../ui.jsx'

const CATEGORIES = ['Hardware','Software','Network','Email/Account','Printer','Phone/Intercom','Broadcast equipment','Training request','Other']
const PRIORITIES = ['Low','Normal','High','Urgent']
const STATUSES = ['open','in_progress','pending_parts','resolved','closed']

export default function Helpdesk() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('active')

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    setLoading(true)
    const { data } = await supabase.from('helpdesk_tickets').select('*').order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const update = { status }
    if (status === 'resolved') update.resolved_at = new Date().toISOString()
    await supabase.from('helpdesk_tickets').update(update).eq('id', id)
    fetchTickets()
  }

  async function deleteTicket(id) {
    if (!confirm('Delete this ticket?')) return
    await supabase.from('helpdesk_tickets').delete().eq('id', id)
    fetchTickets()
  }

  const active = tickets.filter(t => !['resolved','closed'].includes(t.status))
  const filtered = filter === 'active' ? active
    : filter === 'all' ? tickets
    : tickets.filter(t => t.status === filter)

  const open = tickets.filter(t => t.status === 'open').length
  const inProgress = tickets.filter(t => t.status === 'in_progress').length
  const urgent = tickets.filter(t => t.priority === 'Urgent' && !['resolved','closed'].includes(t.status)).length

  return (
    <div>
      <PageHeader title="IT Helpdesk" subtitle="Support tickets from station staff" action={<BtnPrimary onClick={() => { setEditing(null); setShowModal(true) }}>+ New ticket</BtnPrimary>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:'1.5rem' }}>
        <StatCard label="Total" value={tickets.length} />
        <StatCard label="Open" value={open} color={open>0?'var(--red)':undefined} />
        <StatCard label="In progress" value={inProgress} color={inProgress>0?'var(--yellow)':undefined} />
        <StatCard label="Urgent" value={urgent} color={urgent>0?'var(--red)':undefined} />
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:'1rem', flexWrap:'wrap' }}>
        {['active','all','open','in_progress','pending_parts','resolved','closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 12px', borderRadius:'var(--radius)', fontSize:12, cursor:'pointer',
            border:`1px solid ${filter===f?'var(--amber)':'var(--border)'}`,
            background: filter===f?'var(--amber-glow)':'transparent',
            color: filter===f?'var(--amber)':'var(--text-secondary)',
            fontFamily:'var(--mono)',
          }}>{f.replace('_',' ')}</button>
        ))}
      </div>

      {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
        : filtered.length === 0 ? <EmptyState message="No tickets found." action={filter==='active'||filter==='all'?'Create first ticket':null} onAction={() => setShowModal(true)} />
        : (
          <div style={{ display:'grid', gap:10 }}>
            {filtered.map(ticket => (
              <Card key={ticket.id} style={{ borderLeft: ticket.priority==='Urgent'?'3px solid var(--red)':ticket.priority==='High'?'3px solid var(--yellow)':'1px solid var(--border)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-muted)' }}>#{String(ticket.id).slice(-6).toUpperCase()}</span>
                      <h3 style={{ fontSize:14, fontWeight:500 }}>{ticket.title}</h3>
                      <PriorityBadge p={ticket.priority} />
                      <StatusBadge s={ticket.status} />
                    </div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom: ticket.description?6:0 }}>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>🏷 {ticket.category}</span>
                      {ticket.requester_name && <span style={{ fontSize:12, color:'var(--text-muted)' }}>👤 {ticket.requester_name}</span>}
                      {ticket.department && <span style={{ fontSize:12, color:'var(--text-muted)' }}>🏢 {ticket.department}</span>}
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>📅 {formatDateTime(ticket.created_at)}</span>
                    </div>
                    {ticket.description && <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom: ticket.resolution?6:0 }}>{ticket.description}</p>}
                    {ticket.resolution && <p style={{ fontSize:12, color:'var(--green)', background:'var(--green-dim)', padding:'6px 10px', borderRadius:'var(--radius)', marginTop:6 }}>✅ {ticket.resolution}</p>}
                    {ticket.assigned_to && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>🔧 Assigned to: {ticket.assigned_to}</p>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <BtnSecondary onClick={() => { setEditing(ticket); setShowModal(true) }} style={{ padding:'5px 10px', fontSize:12 }}>Edit</BtnSecondary>
                      <button onClick={() => deleteTicket(ticket.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:13 }}>✕</button>
                    </div>
                    <select value={ticket.status} onChange={e => updateStatus(ticket.id, e.target.value)}
                      style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius)', padding:'4px 8px', fontSize:12, cursor:'pointer', fontFamily:'var(--mono)' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {showModal && <TicketModal ticket={editing} onClose={() => setShowModal(false)} onSaved={fetchTickets} />}
    </div>
  )
}

function TicketModal({ ticket, onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', category:'Hardware', priority:'Normal', requester_name:'', department:'', description:'', assigned_to:'', resolution:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    if (ticket) setForm({ title:ticket.title||'', category:ticket.category||'Hardware', priority:ticket.priority||'Normal', requester_name:ticket.requester_name||'', department:ticket.department||'', description:ticket.description||'', assigned_to:ticket.assigned_to||'', resolution:ticket.resolution||'' })
  }, [ticket])

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = ticket
      ? await supabase.from('helpdesk_tickets').update(form).eq('id', ticket.id)
      : await supabase.from('helpdesk_tickets').insert([{ ...form, status:'open' }])
    if (error) { setError(error.message); setLoading(false); return }
    onSaved(); onClose()
  }

  const DEPTS = ['IT','Studio A','Studio B','Engineering','Administration','Sales','News','Production','Other']

  return (
    <Modal title={ticket ? 'Edit ticket' : 'New helpdesk ticket'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:14 }}>
        <Field label="Issue title" required><Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Computer won't turn on in Studio B" required /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Category">
            <Select value={form.category} onChange={e=>set('category',e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={e=>set('priority',e.target.value)}>
              {PRIORITIES.map(p=><option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Requested by"><Input value={form.requester_name} onChange={e=>set('requester_name',e.target.value)} placeholder="Staff name" /></Field>
          <Field label="Department">
            <Select value={form.department} onChange={e=>set('department',e.target.value)}>
              <option value="">— Select —</option>
              {DEPTS.map(d=><option key={d}>{d}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Description"><Textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe the issue in detail..." /></Field>
        <Field label="Assigned to"><Input value={form.assigned_to} onChange={e=>set('assigned_to',e.target.value)} placeholder="Technician handling this" /></Field>
        <Field label="Resolution (fill in when done)"><Textarea value={form.resolution} onChange={e=>set('resolution',e.target.value)} placeholder="How was it resolved?" rows={2} /></Field>
        <ErrorMsg msg={error} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary type="submit" disabled={loading}>{loading?'Saving...':ticket?'Save changes':'Create ticket'}</BtnPrimary>
        </div>
      </form>
    </Modal>
  )
}

function PriorityBadge({ p }) {
  const c = { Low:'var(--text-muted)', Normal:'var(--blue)', High:'var(--yellow)', Urgent:'var(--red)' }
  const bg = { Low:'var(--bg-elevated)', Normal:'var(--blue-dim)', High:'var(--yellow-dim)', Urgent:'var(--red-dim)' }
  return <Badge label={p} color={c[p]} bg={bg[p]} />
}

function StatusBadge({ s }) {
  const c = { open:'var(--red)', in_progress:'var(--yellow)', pending_parts:'var(--purple)', resolved:'var(--green)', closed:'var(--text-muted)' }
  const bg = { open:'var(--red-dim)', in_progress:'var(--yellow-dim)', pending_parts:'var(--purple-dim)', resolved:'var(--green-dim)', closed:'var(--bg-elevated)' }
  return <Badge label={s.replace('_',' ')} color={c[s]} bg={bg[s]} />
}
