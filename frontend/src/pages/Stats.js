import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Stats.css'

export default function Stats() {
  const navigate = useNavigate()

  const [userStats] = useState({
    displayName: 'CodeNinja99',
    joinDate: 'March 2026',
    equippedAvatar: '🦊',
    currentXP: 1250,
    lifetimeXP: 4750,
    totalProjects: 12,
    tasksCompleted: 84,
    currentStreak: 5,
  })

  const currentLevel       = Math.floor(userStats.lifetimeXP / 1000) + 1
  const xpIntoCurrentLevel = userStats.lifetimeXP % 1000
  const progressPercentage = (xpIntoCurrentLevel / 1000) * 100

  return (
    <div className='stats'>
      <div className='stats__inner'>

        <button className='stats__back' onClick={() => navigate(-1)}>← Back</button>
        <h1 className='stats__title'>Player Profile</h1>

        {/* ── Identity + level card ── */}
        <div className='stats__card stats__identity'>
          <div className='stats__avatar'>{userStats.equippedAvatar}</div>

          <div className='stats__identity-info'>
            <h2 className='stats__display-name'>{userStats.displayName}</h2>
            <p className='stats__join-date'>Joined {userStats.joinDate}</p>

            <div className='stats__level-row'>
              <span className='stats__level-label'>Level {currentLevel}</span>
              <span className='stats__level-xp'>{xpIntoCurrentLevel} / 1000 XP</span>
            </div>

            <div className='stats__bar-track'>
              <div
                className='stats__bar-fill'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className='stats__bar-hint'>
              {1000 - xpIntoCurrentLevel} XP to Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className='stats__grid'>
          <div className='stats__stat-card'>
            <div className='stats__stat-icon stats__stat-icon--xp'>✨</div>
            <span className='stats__stat-value'>{userStats.lifetimeXP.toLocaleString()}</span>
            <span className='stats__stat-label'>Lifetime XP</span>
          </div>

          <div className='stats__stat-card'>
            <div className='stats__stat-icon stats__stat-icon--tasks'>✅</div>
            <span className='stats__stat-value'>{userStats.tasksCompleted}</span>
            <span className='stats__stat-label'>Nodes Conquered</span>
          </div>

          <div className='stats__stat-card'>
            <div className='stats__stat-icon stats__stat-icon--projects'>🧠</div>
            <span className='stats__stat-value'>{userStats.totalProjects}</span>
            <span className='stats__stat-label'>Trees Grown</span>
          </div>
        </div>

        {/* ── Streak widget ── */}
        <div className='stats__streak-card'>
          <div className='stats__streak-text'>
            <h3 className='stats__streak-heading'>Learning Streak</h3>
            <p className='stats__streak-sub'>Keep completing tasks daily to keep the fire alive!</p>
          </div>
          <div className='stats__streak-badge'>
            <span className='stats__streak-flame'>🔥</span>
            <span className='stats__streak-count'>{userStats.currentStreak}</span>
            <span className='stats__streak-unit'>Days</span>
          </div>
        </div>

      </div>
    </div>
  )
}