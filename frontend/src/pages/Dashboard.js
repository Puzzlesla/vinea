import '../styles/Dashboard.css'
// ...existing code...
// Icons are now handled by BottomNav
import streakIcon from '../assets/whatshot.svg'
import tree1 from '../assets/tree1.svg'
import tree2 from '../assets/tree2.svg'
import butterflyLight from '../assets/butterfly-light-green.svg'
import butterflyLightRight from '../assets/butterfly-light-green-right.svg'
import butterflyDark from '../assets/butterfly-dark-green.svg'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const treeSprites = [tree1, tree2]

// Each butterfly: path animation moves it across & off screen
const BUTTERFLIES = [
  { id: 1, sprite: butterflyLight,      animClass: 'bf-path-1' },
  { id: 2, sprite: butterflyLightRight, animClass: 'bf-path-2' },
  { id: 3, sprite: butterflyDark,       animClass: 'bf-path-3' },
  { id: 4, sprite: butterflyLight,      animClass: 'bf-path-4' },
  { id: 5, sprite: butterflyLightRight, animClass: 'bf-path-5' },
]

// Scattered layout matching the design — isometric feel
const TREE_POSITIONS = [
  { x: '26%', y: '6%',  size: 'sm'  },
  { x: '48%', y: '4%',  size: 'md'  },
  { x: '68%', y: '10%', size: 'sm'  },
  { x: '30%', y: '44%', size: 'lg'  },
  { x: '56%', y: '36%', size: 'xl'  },
  { x: '78%', y: '52%', size: 'md'  },
  { x: '18%', y: '70%', size: 'sm'  },
  { x: '88%', y: '14%', size: 'sm'  },
]

function formatDate(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Dashboard() {
  const [projects, setProjects]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [user, setUser]                 = useState(auth.currentUser)
  const [hoveredProject, setHovered]   = useState(null)

  const [userStreak, setUserStreak]     = useState(0)
  const navigate  = useNavigate()


  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u))
    return () => unsub()
  }, [])

  // Fetch projects — field is `userId` per your Firestore schema
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'projects'), where('userId', '==', user.uid))
    getDocs(q)
      .then((snapshot) => {
        const allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Only show projects that are not archived or completed
        const activeProjects = allProjects.filter(p => p.status !== 'archived' && p.status !== 'completed')
        setProjects(activeProjects)
        // Derive streak from completed projects count as a placeholder
        setUserStreak(allProjects.filter(p => p.status === 'completed').length || allProjects.length)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const handleTreeClick = (projectId) => {
    navigate(`/treeview/${projectId}`)
  }



  return (
    <main className='dash'>

      {/* ── Left side panel ── */}
      <aside className={`dash__panel ${hoveredProject ? 'dash__panel--active' : ''}`}>
        <div className='dash__pill'>Project Details</div>

        {hoveredProject ? (
          <div className='dash__panel-content'>
            <h3 className='panel__title'>{hoveredProject.title}</h3>

            <div className='panel__row'>
              <span className='panel__label'>Start Date:</span>
              <span>{formatDate(hoveredProject.metadata?.startDate)}</span>
            </div>
            <div className='panel__row'>
              <span className='panel__label'>Due Date:</span>
              <span>{formatDate(hoveredProject.metadata?.endDate)}</span>
            </div>

            {hoveredProject.metadata?.tags?.length > 0 && (
              <div className='panel__tags-row'>
                <span className='panel__label'>Tags:</span>
                <div className='panel__tags'>
                  {hoveredProject.metadata.tags.slice(0, 3).map(tag => (
                    <span key={tag} className='panel__tag'>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className='panel__progress'>
              <span className='panel__label'>Nodes completed:</span>
              <span className='panel__nodes'>
                {hoveredProject.progress?.nodesCompleted ?? 0}
                <span className='panel__nodes-total'>
                  /{hoveredProject.progress?.totalNodes ?? '?'}
                </span>
              </span>
              <div className='panel__bar-track'>
                <div
                  className='panel__bar-fill'
                  style={{
                    width: hoveredProject.progress?.totalNodes
                      ? `${Math.round((hoveredProject.progress.nodesCompleted / hoveredProject.progress.totalNodes) * 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            <div className={`panel__status panel__status--${hoveredProject.status}`}>
              {hoveredProject.status}
            </div>
          </div>
        ) : null}
      </aside>

      {/* ── Forest field ── */}
      <section className='dash__field'>

        {/* Top-right: streak + avatar */}
        <header className='dash__topRight'>
          <div className='dash__streak'>
            <span>{userStreak}</span>
            <img src={streakIcon} alt='streak' aria-hidden='true' />
          </div>
          <button className='dash__avatar' aria-label='Profile'>
            <img
              src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user?.uid || 'PromptAI'}`}
              alt='Profile avatar'
            />
          </button>
        </header>

        {/* Trees */}
        {loading ? (
          <div className='dash__loading'>Loading your forest…</div>
        ) : projects.length === 0 ? (
          <div className='dash__empty'>
            <p>Your forest is empty.</p>
            <p>Add a project to grow your first tree!</p>
          </div>
        ) : (
          projects.map((project, i) => {
            const pos    = TREE_POSITIONS[i % TREE_POSITIONS.length]
            const sprite = treeSprites[i % treeSprites.length]
            const isHov  = hoveredProject?.id === project.id

            return (
              <div
                key={project.id}
                className={`tree tree--${pos.size} ${isHov ? 'tree--hovered' : ''}`}
                style={{ left: pos.x, top: pos.y }}
                onMouseEnter={() => setHovered(project)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleTreeClick(project.id)}
                role='button'
                tabIndex={0}
                aria-label={project.title || 'Project tree'}
                onKeyDown={e => e.key === 'Enter' && handleTreeClick(project.id)}
              >
                {/* Floating sprite */}
                <div className='tree__floater'>
                  <img className='tree__sprite' src={sprite} alt='' draggable={false} />
                </div>

                {/* Isometric base platform */}
                <div className='tree__base' />

                {/* Label shown on hover */}
                {isHov && (
                  <div className='tree__label'>{project.title}</div>
                )}
              </div>
            )
          })
        )}

        {/* Animated butterflies */}
        {BUTTERFLIES.map((b) => (
          <div key={b.id} className={`butterfly ${b.animClass}`} aria-hidden='true'>
            <img src={b.sprite} alt='' draggable={false} />
          </div>
        ))}

        {/* Bottom navigation bar */}
        <BottomNav />
import BottomNav from '../components/BottomNav'

      </section>
    </main>
  )
}