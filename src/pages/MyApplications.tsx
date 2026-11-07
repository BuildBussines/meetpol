import { Icon } from '../components/Icon'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Tilt } from '../components/ui'

export default function MyApplications() {
  const { session } = useAuth(); const [rows, setRows] = useState<any[]>([]); const [interest, setInterest] = useState(0)
  const load = async () => {
    setRows((await supabase.from('applications').select('*, postings(title,company)').eq('applicant_user_id', session.user.id).order('created_at', { ascending: false })).data || [])
    setInterest(Number((await supabase.from('applicant_interest').select('interested').eq('applicant_user_id', session.user.id).maybeSingle()).data?.interested || 0))
  }
  useEffect(() => { load() }, [])
  const withdraw = async (id: string) => { if (confirm('Withdraw this application?')) { await supabase.from('applications').delete().eq('id', id); load() } }
  return (<><h2>My applications</h2>
    <p className="notice"><Icon name="eye" />{interest} employer{interest === 1 ? '' : 's'} showed interest in your profile.</p>
    <div className="cards3">{rows.map(a => <Tilt key={a.id}><h3>{a.postings?.title}</h3><p className="muted">{a.postings?.company}</p>
      <span className={'badge ' + (a.status === 'applied' ? 'pending' : a.status === 'shortlisted' ? 'confirmed' : 'rejected')}>{a.status === 'applied' ? 'waiting' : a.status}</span>
      {a.message && <p>“{a.message}”</p>}
      {a.status === 'applied' && <div className="row"><button className="btn ghost" onClick={() => withdraw(a.id)}>Withdraw</button></div>}</Tilt>)}
      {!rows.length && <p className="muted">You haven't applied anywhere yet. Open the Jobs page and press Apply.</p>}</div></>)
}
