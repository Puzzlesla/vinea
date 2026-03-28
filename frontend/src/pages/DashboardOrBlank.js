import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import Dashboard from './Dashboard'
import BlankDashboard from './BlankDashboard'

export default function DashboardOrBlank() {
  const [loading, setLoading] = useState(true)
  const [hasProjects, setHasProjects] = useState(false)
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u)
      if (!u) setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'projects'), where('userId', '==', user.uid))
    getDocs(q)
      .then((snapshot) => {
        setHasProjects(!snapshot.empty)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setHasProjects(false)
      })
  }, [user])

  if (loading) {
    return <div className="viewer-page viewer-page__loading">Loading…</div>
  }

  return hasProjects ? <Dashboard user={user} /> : <BlankDashboard />
}
