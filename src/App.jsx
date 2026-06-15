import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AuthPage from './AuthPage'
import Sidebar from './Sidebar'
import Equipment from './modules/Equipment'
import Scheduler from './modules/Scheduler'
import Incidents from './modules/Incidents'
import Logbook from './modules/Logbook'
import Helpdesk from './modules/Helpdesk'
import Outages from './modules/Outages'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('equipment')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'var(--text-muted)', fontFamily:'var(--mono)', fontSize:13 }}>Initializing...</p>
    </div>
  )

  if (!session) return <AuthPage />

  const pages = { equipment: Equipment, scheduler: Scheduler, incidents: Incidents, logbook: Logbook, helpdesk: Helpdesk, outages: Outages }
  const PageComponent = pages[page]

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar active={page} onChange={setPage} user={session.user} onSignOut={() => supabase.auth.signOut()} />
      <main style={{ marginLeft:'var(--sidebar-w)', flex:1, padding:'1.75rem 2rem', maxWidth:960, width:'100%' }}>
        <PageComponent />
      </main>
    </div>
  )
}
