import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PageHeader, Card, Badge, BtnPrimary, BtnSecondary, Field, Input, Select, Textarea, Modal, EmptyState, ErrorMsg, StatCard, formatDate, formatDateTime } from '../ui.jsx'

const FREQ = ['One-time','Daily','Weekly','Monthly','Quarterly','Annually']
const PRIORITIES = ['Low','Medium','High','Critical']
const STATUSES = ['scheduled','in_progress','done','skipped']

export default function Scheduler() {
  const [tasks, setTasks] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: t }, { data: e }] = await Promise.all([
      supabase.from('maintenance_tasks').select('*, equipment(name)').order('due_date', { ascending: true }),
      supabase.from('equipment').select('id, name').order('name'),
    ])
    setTasks(t || [])
    setEquipment(e || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('maintenance_tasks').update({ status }).eq('id', id)
    fetchAll()
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return
    await supabase.from('maintenance_tasks').delete().eq('id', id)
    fetchAll()
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const overdue = tasks.filter(t => t.status === 'scheduled' && new Date(t.due_date) < new Date())
  const upcoming = tasks.filter(t => t.status === 'scheduled' && new Date(t.due_date) >= new Date())
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div>
      <PageHeader title="Maintenance Scheduler" subtitle="Schedule and track all maintenance tasks" action={<BtnPrimary onClick={() => { setEditing(null); setShowModal(true) }}>+ Schedule task</BtnPrimary>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:'1.5rem' }}>
        <StatCard label="Total tasks" value={tasks.length} />
        <StatCard label="Overdue" value={overdue.length} color={overdue.length>0?'var(--red)':undefined} />
        <StatCard label="Upcoming" value={upcoming.length} color="var(--yellow)" />
        <StatCard label="Completed" value={done.length} color="var(--green)" />
      </div>

      {overdue.length > 0 && (
        <div style={{ background:'var(--red-dim)', border:'1px solid var(--red)', borderRadius:'var(--radius)', padding:'10px 14px', marginBottom:'1.5rem', fontSize:13, color:'var(--red)' }}>
          ⚠ {overdue.length} overdue task{overdue.length>1?'s':''}: {overdue.map(t=>t.title).join(', ')}
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginBottom:'1rem', flexWrap:'wrap' }}>
        {['all','scheduled','in_progress','done','skipped'].map(f => (
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
        : filtered.length === 0 ? <EmptyState message="No tasks found." action={filter==='all'?'Schedule first task':null} onAction={() => setShowModal(true)} />
        : (
          <div style={{ display:'grid', gap:10 }}>
            {filtered.map(task => (
              <Card key={task.id}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:14, fontWeight:500 }}>{task.title}</h3>
                      <PriorityBadge p={task.priority} />
                      <StatusBadge s={task.status} />
                    </div>
                    {task.equipment && <p style={{ fontSize:12, color:'var(--amber)', fontFamily:'var(--mono)', marginBottom:4 }}>📡 {task.equipment.name}</p>}
                    {task.description && <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>{task.description}</p>}
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>📅 Due: <span style={{ color: new Date(task.due_date)<new Date()&&task.status==='scheduled'?'var(--red)':'var(--text-secondary)' }}>{formatDate(task.due_date)}</span></span>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>🔁 {task.frequency}</span>
                      {task.assigned_to && <span style={{ fontSize:12, color:'var(--text-muted)' }}>👤 {task.assigned_to}</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <BtnSecondary onClick={() => { setEditing(task); setShowModal(true) }} style={{ padding:'5px 10px', fontSize:12 }}>Edit</BtnSecondary>
                      <button onClick={() => deleteTask(task.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:13 }}>✕</button>
                    </div>
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                      style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius)', padding:'4px 8px', fontSize:12, cursor:'pointer', fontFamily:'var(--mono)' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {showModal && (
        <TaskModal
          task={editing}
          equipment={equipment}
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
        />
      )}
    </div>
  )
}

function TaskModal({ task, equipment, onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', equipment_id:'', description:'', priority:'Medium', frequency:'One-time', due_date:'', assigned_to:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    if (task) setForm({ title:task.title||'', equipment_id:task.equipment_id||'', description:task.description||'', priority:task.priority||'Medium', frequency:task.frequency||'One-time', due_date:task.due_date||'', assigned_to:task.assigned_to||'' })
  }, [task])

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    const payload = { ...form, equipment_id: form.equipment_id || null }
    if (!payload.due_date) delete payload.due_date
    const { error } = task
      ? await supabase.from('maintenance_tasks').update(payload).eq('id', task.id)
      : await supabase.from('maintenance_tasks').insert([{ ...payload, status:'scheduled' }])
    if (error) { setError(error.message); setLoading(false); return }
    onSaved(); onClose()
  }

  return (
    <Modal title={task ? 'Edit task' : 'Schedule maintenance task'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:14 }}>
        <Field label="Task title" required><Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Inspect transmitter cooling fans" required /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Equipment">
            <Select value={form.equipment_id} onChange={e=>set('equipment_id',e.target.value)}>
              <option value="">— General (no specific equipment) —</option>
              {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={e=>set('priority',e.target.value)}>
              {PRIORITIES.map(p=><option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Due date"><Input type="date" value={form.due_date} onChange={e=>set('due_date',e.target.value)} /></Field>
          <Field label="Frequency">
            <Select value={form.frequency} onChange={e=>set('frequency',e.target.value)}>
              {FREQ.map(f=><option key={f}>{f}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Assigned to"><Input value={form.assigned_to} onChange={e=>set('assigned_to',e.target.value)} placeholder="Technician name" /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Details, checklist items..." /></Field>
        <ErrorMsg msg={error} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary type="submit" disabled={loading}>{loading?'Saving...':task?'Save changes':'Schedule task'}</BtnPrimary>
        </div>
      </form>
    </Modal>
  )
}

function PriorityBadge({ p }) {
  const c = { Low:'var(--text-muted)', Medium:'var(--blue)', High:'var(--yellow)', Critical:'var(--red)' }
  const bg = { Low:'var(--bg-elevated)', Medium:'var(--blue-dim)', High:'var(--yellow-dim)', Critical:'var(--red-dim)' }
  return <Badge label={p} color={c[p]} bg={bg[p]} />
}

function StatusBadge({ s }) {
  const c = { scheduled:'var(--text-secondary)', in_progress:'var(--yellow)', done:'var(--green)', skipped:'var(--text-muted)' }
  const bg = { scheduled:'var(--bg-elevated)', in_progress:'var(--yellow-dim)', done:'var(--green-dim)', skipped:'var(--bg-elevated)' }
  return <Badge label={s.replace('_',' ')} color={c[s]} bg={bg[s]} />
}
