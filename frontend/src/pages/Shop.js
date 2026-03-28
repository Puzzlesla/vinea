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

  // 1. User state now maps to our nested structure
  const [userStats, setUserStats] = useState({
    xpBalance: 0,
    ownedItems: ['theme_default', 'avatar_default'],
    equippedTheme: 'theme_default',
    equippedAvatar: 'avatar_default'
  })

  // 2. Fetch both Shop Items and User Data
  useEffect(() => {
    const initShop = async () => {
      if (!user) return
      try {
        // Fetch Shop Items (using the 'shopItems' collection name from our schema)
        const shopSnap = await getDocs(collection(db, 'shopItems'))
        const items = shopSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setShopItems(items)

        // Fetch User Data to get real XP and Inventory
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserStats({
            xpBalance: data.gamification?.xpBalance || 0,
            ownedItems: data.inventory?.ownedItems || ['theme_default', 'avatar_default'],
            equippedTheme: data.inventory?.equippedTheme || 'theme_default',
            equippedAvatar: data.inventory?.equippedAvatar || 'avatar_default'
          })
        }
      } catch (err) {
        console.error("Shop Init Error:", err)
      } finally {
        setLoading(false)
      }
    }
    initShop()
  }, [user])

  // 3. Handle Purchase with Nested Field Updates
  const handlePurchase = async (item) => {
    if (userStats.xpBalance < item.cost) return // Check against item.cost (from schema)

    const newXp = userStats.xpBalance - item.cost
    const newOwned = [...userStats.ownedItems, item.id]

    try {
      const userRef = doc(db, 'users', user.uid)
      
      // Update Firestore using dot notation for nested maps
      await updateDoc(userRef, {
        'gamification.xpBalance': newXp,
        'inventory.ownedItems': newOwned
      })

      // Update local state
      setUserStats(prev => ({ 
        ...prev, 
        xpBalance: newXp, 
        ownedItems: newOwned 
      }))
      
      alert(`Success! You've unlocked ${item.name}!`)
    } catch (err) {
      console.error("Purchase failed:", err)
    }
  }

  // 4. Handle Equip logic
  const handleEquip = async (item) => {
    const userRef = doc(db, 'users', user.uid)
    const field = item.type === 'theme' ? 'inventory.equippedTheme' : 'inventory.equippedAvatar'
    
    try {
      await updateDoc(userRef, { [field]: item.id })
      setUserStats(prev => ({
        ...prev,
        [item.type === 'theme' ? 'equippedTheme' : 'equippedAvatar']: item.id
      }))
    } catch (err) {
      console.error("Equip failed:", err)
    }
  }

  if (loading) return <div className="shop__loading">Loading Rewards...</div>

  return (
    <div className='shop'>
      <div className='shop__inner'>
        <button className='shop__back' onClick={() => navigate(-1)}>← Back</button>

        <div className='shop__header'>
          <h1 className='shop__title'>Reward Center</h1>
          <div className='shop__balance'>
            <span className='shop__balance-label'>Your Balance:</span>
            <span className='shop__balance-value'>✨ {userStats.xpBalance.toLocaleString()} XP</span>
          </div>
        </div>

        <div className='shop__grid'>
          {shopItems.map((item) => {
            const isOwned = userStats.ownedItems.includes(item.id)
            const isEquipped = userStats.equippedTheme === item.id || userStats.equippedAvatar === item.id
            const canAfford = userStats.xpBalance >= item.cost

            return (
              <div key={item.id} className={`shop__card ${isOwned ? 'shop__card--owned' : ''}`}>
                <div className="shop__preview">
                  {isEquipped && <div className='shop__equipped-badge'>Equipped</div>}
                  {item.type === 'theme' ? (
                    <div className={`shop__theme-swatch shop__theme--${item.variant}`} />
                  ) : (
                    <div className='shop__avatar-icon' style={{ background: item.avatarBg }}>
                      {item.emoji}
                    </div>
                  )}
                </div>
                
                <div className='shop__card-body'>
                  <h3 className='shop__item-name'>{item.name}</h3>
                  <p className='shop__item-price'>{isOwned ? 'Owned' : `${item.cost} XP`}</p>
                  
                  {!isOwned ? (
                    <button 
                      className='shop__btn' 
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Buy' : 'Not enough XP'}
                    </button>
                  ) : (
                    <button 
                      className='shop__btn shop__btn--equip' 
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