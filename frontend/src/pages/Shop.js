import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import '../styles/Shop.css'

export default function Shop() {
  const navigate = useNavigate()
  const user = auth.currentUser

  const [shopItems, setShopItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [userStats, setUserStats] = useState({
    xpBalance: 0,
    ownedItems: ['theme_default', 'avatar_default'],
    equippedTheme: 'theme_default',
    equippedAvatar: 'avatar_default',
  })

  useEffect(() => {
    const initShop = async () => {
      if (!user) return
      try {
        const shopSnap = await getDocs(collection(db, 'shopItems'))
        const items = shopSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setShopItems(items)

        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserStats({
            xpBalance: data.gamification?.xpBalance || 0,
            ownedItems: data.inventory?.ownedItems || ['theme_default', 'avatar_default'],
            equippedTheme: data.inventory?.equippedTheme || 'theme_default',
            equippedAvatar: data.inventory?.equippedAvatar || 'avatar_default',
          })
        }
      } catch (err) {
        console.error('Shop Init Error:', err)
      } finally {
        setLoading(false)
      }
    }
    initShop()
  }, [user])

  const handlePurchase = async (item) => {
    if (userStats.xpBalance < item.cost) return

    const newXp = userStats.xpBalance - item.cost
    const newOwned = [...userStats.ownedItems, item.id]

    try {
      const userRef = doc(db, 'users', user.uid)

      await updateDoc(userRef, {
        'gamification.xpBalance': newXp,
        'inventory.ownedItems': newOwned,
      })

      setUserStats((prev) => ({
        ...prev,
        xpBalance: newXp,
        ownedItems: newOwned,
      }))

      alert(`Success! You've unlocked ${item.name}!`)
    } catch (err) {
      console.error('Purchase failed:', err)
    }
  }

  const handleEquip = async (item) => {
    const userRef = doc(db, 'users', user.uid)
    const field = item.type === 'theme' ? 'inventory.equippedTheme' : 'inventory.equippedAvatar'

    try {
      await updateDoc(userRef, { [field]: item.id })
      setUserStats((prev) => ({
        ...prev,
        [item.type === 'theme' ? 'equippedTheme' : 'equippedAvatar']: item.id,
      }))
    } catch (err) {
      console.error('Equip failed:', err)
    }
  }

  if (loading) {
    return <div className="shop__loading viewer-page viewer-page__loading">Loading Rewards...</div>
  }

  return (
    <div className="shop viewer-page">
      <div className="shop__inner">
        <button type="button" className="shop__back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="shop__header">
          <h1 className="shop__title">Reward Center</h1>
          <div className="shop__balance">
            <span className="shop__balance-label">Your Balance:</span>
            <span className="shop__balance-value">✨ {userStats.xpBalance.toLocaleString()} XP</span>
          </div>
        </div>

        <div className="shop__grid">
          {shopItems.map((item) => {
            const isOwned = userStats.ownedItems.includes(item.id)
            const isEquipped =
              userStats.equippedTheme === item.id || userStats.equippedAvatar === item.id
            const canAfford = userStats.xpBalance >= item.cost

            return (
              <div
                key={item.id}
                className={`shop__card ${isOwned ? 'shop__card--owned' : ''} ${isEquipped ? 'shop__card--equipped' : ''}`}
              >
                <div className="shop__preview">
                  {isEquipped && <div className="shop__equipped-badge">Equipped</div>}
                  {item.type === 'theme' ? (
                    <div className={`shop__theme-swatch shop__theme--${item.variant || 'classic'}`} />
                  ) : (
                    <div className="shop__avatar-icon" style={{ background: item.avatarBg }}>
                      {item.emoji}
                    </div>
                  )}
                </div>

                <div className="shop__card-body">
                  <h3 className="shop__item-name">{item.name}</h3>
                  <p className="shop__item-price">{isOwned ? 'Owned' : `${item.cost} XP`}</p>

                  {!isOwned ? (
                    <button
                      type="button"
                      className="shop__btn shop__btn--purchase"
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Buy' : 'Not enough XP'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`shop__btn shop__btn--equip ${isEquipped ? 'shop__btn--equipped' : ''}`}
                      onClick={() => handleEquip(item)}
                      disabled={isEquipped}
                    >
                      {isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
