import { auth } from '../firebase.js'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import '../styles/AddProjectDashboard.css'

const FILE_MAX_BYTES = 5 * 1024 * 1024 // 5 MB per file
const MAX_FILES = 8

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const CalendarIcon = () => (
  <svg className="add-project__calendar-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const UploadCloudIcon = () => (
  <svg className="add-project__upload-icon" viewBox="0 0 64 64" fill="none" aria-hidden>
    <path
      d="M18 42h-2a10 10 0 1 1 15-8.7A12 12 0 0 1 46 44h-2"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M32 24v22M24 34l8-10 8 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const defaultTags = [
  { id: 't1', label: 'Creative', variant: 'green' },
  { id: 't2', label: 'Computer Science', variant: 'pink' },
  { id: 't3', label: 'CS 2208A', variant: 'outline' },
  { id: 't4', label: 'Data Processing', variant: 'pink' },
]

const PlantNextAdventure = () => {
  const [user, setUser] = useState(auth.currentUser)
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(5)
  const [tags, setTags] = useState(defaultTags)
  const [tagDraft, setTagDraft] = useState('')
  const [files, setFiles] = useState([])
  const [uploadError, setUploadError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [startMessage, setStartMessage] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const previewName = import.meta.env.VITE_DEV_PREVIEW_NAME?.trim()
  const displayName =
    previewName ||
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'there'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const onStartDateChange = (e) => {
    const v = e.target.value
    setStartDate(v)
    if (v && endDate && endDate < v) {
      setEndDate(v)
    }
  }

  const onEndDateChange = (e) => {
    const v = e.target.value
    if (startDate && v && v < startDate) {
      setEndDate(startDate)
      return
    }
    setEndDate(v)
  }

  const addFiles = useCallback((fileList) => {
    const next = Array.from(fileList || [])
    setFiles((prev) => {
      const combined = [...prev]
      let err = ''
      for (const file of next) {
        if (combined.length >= MAX_FILES) {
          err = `You can upload at most ${MAX_FILES} files.`
          break
        }
        if (file.size > FILE_MAX_BYTES) {
          err = `"${file.name}" is ${formatBytes(file.size)}. Max per file is ${formatBytes(FILE_MAX_BYTES)}.`
          continue
        }
        combined.push(file)
      }
      queueMicrotask(() => setUploadError(err))
      return combined
    })
  }, [])

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setUploadError('')
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const onDragLeave = () => setDragActive(false)

  const removeTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
  }

  const addTagFromInput = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const label = tagDraft.trim()
    if (!label) return
    setTags((prev) => [...prev, { id: nanoid(), label, variant: 'outline' }])
    setTagDraft('')
  }

  const handleStart = () => {
    const trimmed = description.trim()
    if (!trimmed) {
      setStartMessage('Please describe your project vision first.')
      return
    }
    setStartMessage('')
    const payload = {
      description: trimmed,
      startDate: startDate || null,
      endDate: endDate || null,
      weeklyHours,
      tags: tags.map((t) => t.label),
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    }
    console.log('Start project', payload)
    setStartMessage(
      'Project draft saved locally. Connect this action to your API or Firestore to persist and generate the roadmap.',
    )
  }

  const tagClass = (variant) => {
    if (variant === 'green') return 'add-project__tag add-project__tag--green'
    if (variant === 'pink') return 'add-project__tag add-project__tag--pink'
    return 'add-project__tag add-project__tag--outline'
  }

  return (
    <div className="add-project">
      <div className="add-project__top-bar">
        <button type="button" className="add-project__sign-out" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      <p className="add-project__crumb">
        <Link className="add-project__crumb-link" to="/dashboard">
          Dashboard
        </Link>
        <span className="add-project__crumb-sep">&gt;</span>
        <span>Add New Project</span>
      </p>

      <h1 className="add-project__title">Plant Your Next Adventure</h1>
      <p className="add-project__greet">Welcome, {displayName}. What are you working on?</p>

      <main className="add-project__shell">
        <textarea
          className="add-project__chat"
          placeholder="Describe your vision and what project you are working on"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />

        <div className="add-project__grid">
          <section className="add-project__card">
            <h2 className="add-project__card-title">Project Overview</h2>
            <div className="add-project__dates">
              <div className="add-project__date-field">
                <label htmlFor="start-date">Start Date</label>
                <div className="add-project__date-wrap">
                  <CalendarIcon />
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={onStartDateChange}
                  />
                </div>
              </div>
              <div className="add-project__date-field">
                <label htmlFor="end-date">End Date</label>
                <div className="add-project__date-wrap">
                  <CalendarIcon />
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={onEndDateChange}
                  />
                </div>
              </div>
            </div>

            <div className="add-project__commitment">
              <div className="add-project__hours-row">
                <label htmlFor="weekly-hours">Weekly Commitment</label>
                <span className="add-project__hours-value">{weeklyHours} hours</span>
              </div>
              <input
                id="weekly-hours"
                type="range"
                className="add-project__range"
                min={1}
                max={40}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
              />
            </div>

            <div>
              <div className="add-project__tags-label">Skills &amp; Keyword Tags</div>
              <div className="add-project__tags">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={tagClass(t.variant)}
                    onClick={() => removeTag(t.id)}
                    title="Click to remove"
                  >
                    {t.label}
                  </button>
                ))}
                <input
                  className="add-project__tag-input"
                  placeholder="Add tag — Enter"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={addTagFromInput}
                />
              </div>
            </div>
          </section>

          <section className="add-project__card">
            <h2 className="add-project__card-title">Add Document(s)</h2>
            <div
              className={`add-project__upload-inner${dragActive ? ' add-project__upload-inner--active' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <UploadCloudIcon />
              <p className="add-project__upload-text">
                Drag &amp; Drop your files or{' '}
                <button
                  type="button"
                  className="add-project__browse"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse
                </button>
              </p>
              <p className="add-project__upload-hint">
                Up to {MAX_FILES} files · max {formatBytes(FILE_MAX_BYTES)} each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              {uploadError ? <p className="add-project__file-error">{uploadError}</p> : null}
              {files.length > 0 ? (
                <ul className="add-project__file-list">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`}>
                      <span>
                        {f.name} ({formatBytes(f.size)})
                      </span>
                      <button type="button" className="add-project__file-remove" onClick={() => removeFile(i)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          <section className="add-project__card add-project__card--preview">
            <h2 className="add-project__card-title">Preview</h2>
            <div className="add-project__preview-body">
              <p className="add-project__preview-placeholder">
                Your roadmap preview will show here once the project is generated from your description and dates.
              </p>
            </div>
            <p className="add-project__preview-note">
              Dates and hours can also be suggested later by chat — set them now or leave blank.
            </p>
          </section>
        </div>
      </main>

      <footer className="add-project__footer">
        <button type="button" className="add-project__start" onClick={handleStart}>
          Start!
        </button>
      </footer>

      {startMessage ? (
        <p
          style={{
            textAlign: 'center',
            color: '#5c5c5c',
            fontSize: 14,
            marginTop: 16,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {startMessage}
        </p>
      ) : null}
    </div>
  )
}

export default PlantNextAdventure
