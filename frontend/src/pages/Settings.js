import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import '../styles/Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('appTheme') === 'dark'
  })

  const [aiPersonality, setAiPersonality] = useState('coach')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('appTheme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('appTheme', 'light')
    }
  }, [isDarkMode])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This will permanently delete all your projects and XP.'
    )
    if (confirmed) {
      alert('Account deletion logic will go here!')
    }
  }

  return (
    <div className="settings viewer-page">
      <div className="settings__inner">
        <button type="button" className="settings__back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1 className="settings__title">Settings</h1>

        <div className="settings__card">
          <h2 className="settings__card-title">App Preferences</h2>

          <div className="settings__row">
            <div className="settings__row-text">
              <span className="settings__row-label">Dark Mode</span>
              <p className="settings__row-desc">Easier on the eyes for late-night coding.</p>
            </div>
            <button
              type="button"
              className={`settings__toggle ${isDarkMode ? 'settings__toggle--on' : ''}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
              role="switch"
              aria-checked={isDarkMode}
            >
              <span className="settings__toggle-knob" />
            </button>
          </div>

          <hr className="settings__divider" />

          <div className="settings__row">
            <div className="settings__row-text">
              <span className="settings__row-label">AI Manager Personality</span>
              <p className="settings__row-desc">How should the AI talk to you?</p>
            </div>
            <select
              className="settings__select"
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
            >
              <option value="coach">Encouraging Coach</option>
              <option value="strict">Strict Manager</option>
              <option value="casual">Casual Mentor</option>
            </select>
          </div>
        </div>

        <div className="settings__card">
          <h2 className="settings__card-title">Account Management</h2>

          <button type="button" className="settings__btn">
            Change Display Name
          </button>
          <button type="button" className="settings__btn">
            Change Email
          </button>
          <button type="button" className="settings__btn">
            Reset Password
          </button>

          <button type="button" className="settings__btn settings__btn--signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        <div className="settings__card settings__card--danger">
          <h2 className="settings__card-title settings__card-title--danger">Danger Zone</h2>
          <p className="settings__danger-desc">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button type="button" className="settings__btn--delete" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
