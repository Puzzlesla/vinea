import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import Dashboard from './Dashboard'
import BlankDashboard from './BlankDashboard'

/**
 * Checks if the current user has any projects in Firestore.
 * If projects exist, renders Dashboard; otherwise, renders BlankDashboard.
 * BottomNav is rendered inside each page — NOT here.
 */
export default function DashboardOrBlank() {
  const [loading, setLoading]         = useState(true)
  const [hasProjects, setHasProjects] = useState(false)
  const [user, setUser]               = useState(auth.currentUser)

  // Wait for auth to resolve before doing anything
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u)
      if (!u) setLoading(false) // not logged in — stop loading
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

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>

  // Pass user down so Dashboard doesn't need to re-resolve auth
  return hasProjects ? <Dashboard user={user} /> : <BlankDashboard />
}