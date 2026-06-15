import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PageHeader, Card, Badge, BtnPrimary, BtnSecondary, Field, Input, Select, Textarea, Modal, EmptyState, ErrorMsg, formatDate, formatDateTime } from '../ui.jsx'

const CATEGORIES = ['General','Maintenance','Broadcast','Network','Power','Security','Visitor/Delivery','Other']
const SHIFTS = ['Morning (6AM–2PM)','Afternoon (2PM–10PM)','Evening (10PM–6AM)','Day shift','Full day']

export default function Logbook() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase.from('logbook').select('*').order('log_date', { ascending: false }).order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  async function deleteEntry(id) {
    if (!confirm('Delete this log entry?')) return
    await supabase.from('logbook').delete().eq('id', id)
    fetchEntries()
  }

  const filtered = entries.filter(e => {
    const matchDate = !dateFilter || e.log_date === dateFilter
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || (e.notes||'').toLowerCase().includes(search.toLowerCase())
    return matchDate && matchSearch
  })

  // Group by date
  const grouped = filtered.reduce((acc, e) => {
    const d = e.log_date || e.created_at?.split('T')[0]
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <PageHeader title="Daily Logbook" subtitle="Daily activity and shift records" action={<BtnPrimary onClick={() => { setEditing(null); setShowModal(true) }}>+ Add entry</BtnPrimary>} />

      <div style={{ display:'flex', gap:10, marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." style={{ flex:1, minWidth:180 }} />
        <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width:'auto' }} />
        {dateFilter && <BtnSecondary onClick={() => setDateFilter('')}>Clear date</BtnSecondary>}
        <BtnSecondary onClick={() => setDateFilter(today)}>Today</BtnSecondary>
      </div>

      {loading ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
        : filtered.length === 0 ? <EmptyState message="No log entries found." action="Add first entry" onAction={() => setShowModal(true)} />
        : (
          <div style={{ display:'grid', gap:20 }}>
            {Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(date => (
              <div key={date}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--amber)', background:'var(--amber-glow)', padding:'3px 10px', borderRadius:4, border:'1px solid var(--amber-dim)' }}>
                    {date === today ? '📅 Today' : formatDate(date)}
                  </span>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{grouped[date].length} entr{grouped[date].length>1?'ies':'y'}</span>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {grouped[date].map(entry => (
                    <Card key={entry.id}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'start' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                            <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text-muted)', background:'var(--bg-elevated)', padding:'2px 7px', borderRadius:4 }}>{entry.category}</span>
                            {entry.shift && <span style={{ fontSize:11, color:'var(--text-muted)' }}>🕐 {entry.shift}</span>}
                            {entry.technician && <span style={{ fontSize:11, color:'var(--text-muted)' }}>👤 {entry.technician}</span>}
                          </div>
                          <h3 style={{ fontSize:14, fontWeight:500, marginBottom: entry.notes?6:0 }}>{entry.title}</h3>
                          {entry.notes && <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{entry.notes}</p>}
                        </div>
                        <div style={{ display:'flex', gap:6 }}>
                          <BtnSecondary onClick={() => { setEditing(entry); setShowModal(true) }} style={{ padding:'4px 10px', fontSize:11 }}>Edit</BtnSecondary>
                          <button onClick={() => deleteEntry(entry.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:13 }}>✕</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && <LogEntryModal entry={editing} onClose={() => setShowModal(false)} onSaved={fetchEntries} />}
    </div>
  )
}

function LogEntryModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState({ log_date: new Date().toISOString().split('T')[0], title:'', category:'General', shift:'Day shift', technician:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    if (entry) setForm({ log_date:entry.log_date||'', title:entry.title||'', category:entry.category||'General', shift:entry.shift||'Day shift', technician:entry.technician||'', notes:entry.notes||'' })
  }, [entry])

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = entry
      ? await supabase.from('logbook').update(form).eq('id', entry.id)
      : await supabase.from('logbook').insert([form])
    if (error) { setError(error.message); setLoading(false); return }
    onSaved(); onClose()
  }

  return (
    <Modal title={entry ? 'Edit log entry' : 'New log entry'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Date"><Input type="date" value={form.log_date} onChange={e=>set('log_date',e.target.value)} /></Field>
          <Field label="Category">
            <Select value={form.category} onChange={e=>set('category',e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Entry title" required><Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Replaced Studio A mic cable" required /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Shift">
            <Select value={form.shift} onChange={e=>set('shift',e.target.value)}>
              {SHIFTS.map(s=><option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Technician"><Input value={form.technician} onChange={e=>set('technician',e.target.value)} placeholder="Your name" /></Field>
        </div>
        <Field label="Notes / Details"><Textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Additional details, observations, follow-ups..." rows={4} /></Field>
        <ErrorMsg msg={error} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary type="submit" disabled={loading}>{loading?'Saving...':entry?'Save changes':'Add entry'}</BtnPrimary>
        </div>
      </form>
    </Modal>
  )
}
