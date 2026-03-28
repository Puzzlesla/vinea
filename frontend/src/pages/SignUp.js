import '../styles/SignUp.css'
import { auth, googleProvider } from '../firebase.js'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (error) {
      console.error('Error during sign-up:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (error) {
      console.error('Error during Google Sign-In:', error)
    }
  }

  return (
    <div className="signup viewer-page">
        <div className="signup__card">
          <img src={logo} alt="" className="signup__logo" />
          <h2 className="signup__title">Sign Up</h2>
          <input
            className="signup__input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="signup__input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="signup__btn signup__btn--primary" onClick={signUp}>
            Sign up
          </button>
          <button type="button" className="signup__btn signup__btn--outline" onClick={signInWithGoogle}>
            Sign up with Google
          </button>
          <button type="button" className="signup__btn signup__btn--link" onClick={() => navigate('/')}>
            Back to Login
          </button>
        </div>
      </div>
  )
}

export default SignUp
