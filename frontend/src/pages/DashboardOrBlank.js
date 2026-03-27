import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import Dashboard from './Dashboard'
import BlankDashboard from './BlankDashboard'
import BottomNav from '../components/BottomNav'

/**
 * This component checks if the current user has any projects in Firestore.
 * If projects exist, renders Dashboard; otherwise, renders BlankDashboard.
 * Used as the index route for /dashboard.
 */
export default function DashboardOrBlank() {
  const [loading, setLoading] = useState(true)
  const [hasProjects, setHasProjects] = useState(false)
  const [user, setUser] = useState(auth.currentUser)


  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    // Query projects where userId == user.uid
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

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Loading...</div>
  return (
    <>
      {hasProjects ? <Dashboard /> : <BlankDashboard />}
      <BottomNav />
    </>
  )
}
