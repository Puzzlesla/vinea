import '../styles/LogIn.css'
import { auth, googleProvider } from '../firebase.js'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logInTree from '../assets/logInTree.svg'
import cherryBlossom from '../assets/cherryBlossomTree.svg'

const Auth = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const logIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error during Google Sign-In:', error)
    }
  }

  return (
    <div className='login'>

      {/* Left: form panel */}
      <div className='login__panel'>
        <div className='login__card'>

          <img src={logInTree} alt='PromptAI' className='login__logo' />
          <h2 className='login__title'>Sign In</h2>

          <input
            className='login__input'
            type='email'
            placeholder='Email'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className='login__input'
            type='password'
            placeholder='Password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className='login__btn login__btn--primary' onClick={logIn}>
            Log in
          </button>
          <button className='login__btn login__btn--secondary' onClick={() => navigate('/signup')}>
            Sign up
          </button>
          <button className='login__btn login__btn--google' onClick={signInWithGoogle}>
            Sign in with Google
          </button>

        </div>
      </div>

      {/* Right: cherry blossom visual */}
      <div className='login__visual'>
        <img src={cherryBlossom} alt='Cherry Blossom Tree' className='login__tree' />
      </div>

    </div>
  )
}

export default Auth