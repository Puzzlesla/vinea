import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Shop.css'

export default function Shop() {
  const navigate = useNavigate()
  const [xpBalance, setXpBalance]       = useState(2000)
  const [ownedItems, setOwnedItems]     = useState(['theme_default', 'avatar_default'])
  const [equippedTheme, setEquipped]    = useState('theme_default')
  const [equippedAvatar, setEquippedAv] = useState('avatar_default')

  const shopItems = [
    {
      id: 'theme_default', category: 'theme', name: 'Classic PromptAI',
      description: 'The standard pink and green aesthetic you know and love.',
      price: 0,
      preview: <ThemePreview variant='classic' />,
    },
    {
      id: 'theme_cyberpunk', category: 'theme', name: 'Neon Hacker',
      description: 'High contrast dark mode with cyan neon accents.',
      price: 500,
      preview: <ThemePreview variant='cyber' />,
    },
    {
      id: 'avatar_fox', category: 'avatar', name: 'Focus Fox',
      description: 'A sleek, focused fox for your profile picture.',
      price: 300, emoji: '🦊', avatarBg: '#fff3e0',
    },
    {
      id: 'avatar_owl', category: 'avatar', name: 'Night Owl',
      description: 'For the late-night coders who never sleep.',
      price: 300, emoji: '🦉', avatarBg: '#e8eaf6',
    },
    {
      id: 'feature_darkmode', category: 'feature', name: 'Dark Mode UI',
      description: 'Unlock the master Dark Mode toggle in your Settings.',
      price: 1000,
    },
    {
      id: 'powerup_reroll', category: 'powerup', name: 'AI Re-Roll Token',
      description: 'Force the AI to regenerate a specific task branch.',
      price: 150, consumable: true,
    },
  ]

  const handlePurchase = (item) => {
    if (xpBalance < item.price) return
    setXpBalance(prev => prev - item.price)
    if (!item.consumable) {
      setOwnedItems(prev => [...prev, item.id])
      if (item.category === 'theme')   setEquipped(item.id)
      if (item.category === 'avatar')  setEquippedAv(item.id)
      if (item.category === 'feature') alert(`You unlocked ${item.name}! Check your Settings page.`)
    } else {
      alert(`You bought an ${item.name}!`)
    }
  }

  const handleEquip = (item) => {
    if (item.category === 'theme')  setEquipped(item.id)
    if (item.category === 'avatar') setEquippedAv(item.id)
  }

  return (
    <div className='shop'>
      <div className='shop__inner'>

        <button className='shop__back' onClick={() => navigate(-1)}>← Back</button>

        {/* Header */}
        <div className='shop__header'>
          <div>
            <h1 className='shop__heading'>Reward Center</h1>
            <p className='shop__subheading'>Spend your hard-earned XP to customize your workspace.</p>
          </div>

          <div className='shop__xp-badge'>
            <div className='shop__xp-icon'>✨</div>
            <div>
              <span className='shop__xp-label'>Available XP</span>
              <span className='shop__xp-value'>{xpBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className='shop__grid'>
          {shopItems.map((item) => {
            const isOwned    = ownedItems.includes(item.id)
            const isEquipped = equippedTheme === item.id || equippedAvatar === item.id
            const canAfford  = xpBalance >= item.price

            return (
              <div
                key={item.id}
                className={`shop__card
                  ${isOwned    ? 'shop__card--owned'    : ''}
                  ${isEquipped ? 'shop__card--equipped' : ''}
                `}
              >
                {/* Preview zone */}
                <div className={`shop__preview shop__preview--${item.category}`}>

                  {/* Equipped badge */}
                  {isEquipped && (
                    <div className='shop__equipped-badge'>Equipped</div>
                  )}

                  {/* Category badge */}
                  <div className='shop__category-badge'>{item.category}</div>

                  {/* Theme preview */}
                  {item.category === 'theme' && item.preview}

                  {/* Avatar preview */}
                  {item.category === 'avatar' && (
                    <div
                      className='shop__avatar-circle'
                      style={{ background: item.avatarBg }}
                    >
                      {item.emoji}
                    </div>
                  )}

                  {/* Feature preview */}
                  {item.category === 'feature' && (
                    <div className='shop__feature-split'>
                      <div className='shop__feature-half shop__feature-half--light'>☀️</div>
                      <div className='shop__feature-half shop__feature-half--dark'>🌙</div>
                    </div>
                  )}

                  {/* Powerup preview */}
                  {item.category === 'powerup' && (
                    <div className='shop__powerup-token'>⚡</div>
                  )}
                </div>

                {/* Card body */}
                <div className='shop__card-body'>
                  <div className='shop__card-header'>
                    <h3 className='shop__card-name'>{item.name}</h3>
                    {!isOwned && (
                      <span className={`shop__price-tag ${item.price === 0 ? 'shop__price-tag--free' : ''}`}>
                        {item.price === 0 ? 'Free' : `${item.price} XP`}
                      </span>
                    )}
                  </div>
                  <p className='shop__card-desc'>{item.description}</p>

                  {/* Action button */}
                  <div className='shop__card-action'>
                    {item.category === 'feature' && isOwned ? (
                      <button className='shop__btn shop__btn--unlocked' disabled>
                        ✓ Unlocked
                      </button>
                    ) : isEquipped ? (
                      <button className='shop__btn shop__btn--equipped' disabled>
                        ✓ Equipped
                      </button>
                    ) : isOwned && !item.consumable ? (
                      <button className='shop__btn shop__btn--equip' onClick={() => handleEquip(item)}>
                        Equip
                      </button>
                    ) : canAfford ? (
                      <button className='shop__btn shop__btn--purchase' onClick={() => handlePurchase(item)}>
                        Purchase — {item.price === 0 ? 'Free' : `${item.price} XP`}
                      </button>
                    ) : (
                      <button className='shop__btn shop__btn--disabled' disabled>
                        Need more XP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

/* ── Sub-components ── */
function ThemePreview({ variant }) {
  return (
    <div className={`shop__mini-node shop__mini-node--${variant}`}>
      <div style={{
        width: 40, height: 6, borderRadius: 3,
        background: variant === 'cyber' ? '#00e5ff' : 'rgba(255,255,255,0.6)'
      }} />
    </div>
  )
}