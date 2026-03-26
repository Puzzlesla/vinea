import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase.js'

/** In dev (`npm run dev`), skip the login redirect unless `VITE_REQUIRE_AUTH=true` in `.env`. Production always requires auth. */
const skipAuthRedirect =
  import.meta.env.PROD ? false : import.meta.env.VITE_REQUIRE_AUTH !== 'true'

export default function RequireAuth({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (skipAuthRedirect) return
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate('/', { replace: true })
    })
    return () => unsub()
  }, [navigate])

  return children
}
