import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { PageHeader, Card, Badge, BtnPrimary, BtnSecondary, Field, Input, Select, Textarea, Modal, EmptyState, ErrorMsg, StatCard, formatDateTime } from '../ui.jsx'

const TYPES = ['Transmitter','Power','Network/Internet','Signal','Studio equipment','Full station','Other']
const CAUSES = ['Equipment failure','Power interruption','Natural disaster','Human error','ISP issue','Unknown','Scheduled maintenance']

export default function Outages() {
  const [outages, setOutages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchOutages() }, [])

  async function fetchOutages() {
    setLoading(true)
    const { data } = await supabase.from('outages').select('*').order('started_at', { ascending: false })
    setOutages(data || [])
    setLoading(false)
  }

  async function markRestored(id) {
    await supabase.from('outages').update({ restored_at: new Date().toISOString(), status: 'restored' }).eq('id', id)
    fetchOutages()
  }

  async function deleteOutage(id) {
    if (!confirm('Delete this outage report?')) return
    await supabase.from('outages').delete().eq('id', id)
    fetchOutages()
  }

  const active = outages.filter(o => o.status === 'active')
  const filtered = filter === 'all' ? outages : outages.filter(o => o.status === filter)

  const totalDowntime = outages
    .filter(o => o.restored_at)
    .reduce((acc, o) => {
      const mins = Math.floor((new Date(o.restored_at) - new Date(o.started_at)) / 60000)
      return acc + mins
    }, 0)

  function durationStr(start, end) {
    if (!end) return 'Ongoing ⚠'
    const mins = Math.floor((new Date(end) - new Date(start)) / 60000)
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60), m = mins % 60
    return `${h}h ${m}m`
  }

  return (
    <div>
      <PageHeader title="Outage Reports" subtitle="Track all station outages and signal loss events"
        action={<BtnPrimary onClick={() => { setEditing(null); setShowModal(true) }}>+ Report outage</BtnPrimary>} />

      {active.length > 0 && (
        <div style={{ background:'var(--red-dim)', border:'2px solid var(--red)', borderRadius:'var(--radius-lg)', padding:'14px 16px', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:16 }}>🔴</span>
            <span style={{ color:'var(--red)', fontWeight:600, fontSize:14 }}>{active.length} active outage{active.length>1?'s':''}</span>
          </div>
          {active.map(o => (
            <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(229,57,53,0.08)', borderRadius:'var(--radius)', padding:'8px 12px', marginBottom:6 }}>
              <div>
                <span style={{ fontWeight:500, fontSize:13 }}>{o.title}</span>
                <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:10 }}>{o.outage_type} · Started {formatDateTime(o.started_at)}</span>
              </div>
              <BtnPrimary onClick={() => markRestored(o.id)} style={{ padding:'5px 12px', fontSize:12 }}>Mark restored ✓</BtnPrimary>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:'1.5rem' }}>
        <StatCard label="Total outages" value={outages.length} />
        <StatCard label="Active now" value={active.length} color={active.length>0?'var(--red)':undefined} />
        <StatCard label="Resolved" value={outages.filter(o=>o.status==='restored').length} color="var(--green)" />
        <StatCard label="Total downtime" value={totalDowntime >= 60 ? `${Math.floor(totalDowntime/60)}h ${totalDowntime%60}m` : `${totalDowntime}m`} sub="all time" />
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:'1rem' }}>
        {['all','active','restored'].map(f => (
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
        : filtered.length === 0 ? <EmptyState message="No outage reports." action={filter==='all'?'Report an outage':null} onAction={() => setShowModal(true)} />
        : (
          <div style={{ display:'grid', gap:10 }}>
            {filtered.map(o => (
              <Card key={o.id} style={{ borderLeft: o.status==='active'?'3px solid var(--red)':'1px solid var(--border)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:14, fontWeight:500 }}>{o.title}</h3>
                      <Badge label={o.outage_type} color="var(--text-secondary)" bg="var(--bg-elevated)" />
                      <Badge
                        label={o.status === 'active' ? '🔴 ACTIVE' : '✅ Restored'}
                        color={o.status==='active'?'var(--red)':'var(--green)'}
                        bg={o.status==='active'?'var(--red-dim)':'var(--green-dim)'}
                      />
                    </div>
                    <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom: o.description?6:0, fontSize:12, color:'var(--text-muted)' }}>
                      <span>🕐 Started: {formatDateTime(o.started_at)}</span>
                      {o.restored_at && <span>✅ Restored: {formatDateTime(o.restored_at)}</span>}
                      <span>⏱ Duration: <b style={{ color: o.status==='active'?'var(--red)':'var(--text-secondary)' }}>{durationStr(o.started_at, o.restored_at)}</b></span>
                    </div>
                    {o.cause && <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>🔍 Cause: {o.cause}</p>}
                    {o.description && <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom: o.action_taken?6:0 }}>{o.description}</p>}
                    {o.action_taken && <p style={{ fontSize:12, color:'var(--green)', background:'var(--green-dim)', padding:'6px 10px', borderRadius:'var(--radius)' }}>🔧 Action taken: {o.action_taken}</p>}
                    {o.reported_by && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>👤 Reported by: {o.reported_by}</p>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                    {o.status === 'active' && <BtnPrimary onClick={() => markRestored(o.id)} style={{ padding:'6px 12px', fontSize:12 }}>Mark restored</BtnPrimary>}
                    <BtnSecondary onClick={() => { setEditing(o); setShowModal(true) }} style={{ padding:'5px 10px', fontSize:12 }}>Edit</BtnSecondary>
                    <button onClick={() => deleteOutage(o.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:12 }}>Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {showModal && <OutageModal outage={editing} onClose={() => setShowModal(false)} onSaved={fetchOutages} />}
    </div>
  )
}

function OutageModal({ outage, onClose, onSaved }) {
  const now = new Date().toISOString().slice(0,16)
  const [form, setForm] = useState({ title:'', outage_type:'Transmitter', cause:'Equipment failure', started_at:now, restored_at:'', description:'', action_taken:'', reported_by:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    if (outage) setForm({
      title:outage.title||'', outage_type:outage.outage_type||'Transmitter', cause:outage.cause||'Equipment failure',
      started_at:outage.started_at?.slice(0,16)||now, restored_at:outage.restored_at?.slice(0,16)||'',
      description:outage.description||'', action_taken:outage.action_taken||'', reported_by:outage.reported_by||''
    })
  }, [outage])

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    const payload = {
      ...form,
      started_at: new Date(form.started_at).toISOString(),
      restored_at: form.restored_at ? new Date(form.restored_at).toISOString() : null,
      status: form.restored_at ? 'restored' : 'active',
    }
    const { error } = outage
      ? await supabase.from('outages').update(payload).eq('id', outage.id)
      : await supabase.from('outages').insert([payload])
    if (error) { setError(error.message); setLoading(false); return }
    onSaved(); onClose()
  }

  return (
    <Modal title={outage ? 'Edit outage report' : 'Report outage'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:14 }}>
        <Field label="Outage title" required><Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. FM transmitter signal loss" required /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Type">
            <Select value={form.outage_type} onChange={e=>set('outage_type',e.target.value)}>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Cause">
            <Select value={form.cause} onChange={e=>set('cause',e.target.value)}>
              {CAUSES.map(c=><option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Started at"><Input type="datetime-local" value={form.started_at} onChange={e=>set('started_at',e.target.value)} /></Field>
          <Field label="Restored at (leave blank if still active)"><Input type="datetime-local" value={form.restored_at} onChange={e=>set('restored_at',e.target.value)} /></Field>
        </div>
        <Field label="Description"><Textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What was affected? Any visible symptoms?" /></Field>
        <Field label="Action taken"><Textarea value={form.action_taken} onChange={e=>set('action_taken',e.target.value)} placeholder="Steps taken to resolve the outage" rows={2} /></Field>
        <Field label="Reported by"><Input value={form.reported_by} onChange={e=>set('reported_by',e.target.value)} placeholder="Your name" /></Field>
        <ErrorMsg msg={error} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary type="submit" disabled={loading}>{loading?'Saving...':outage?'Save changes':'Report outage'}</BtnPrimary>
        </div>
      </form>
    </Modal>
  )
}
