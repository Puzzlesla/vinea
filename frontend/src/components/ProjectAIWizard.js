import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useNavigate } from 'react-router-dom'
import { app, db } from '../firebase.js'

/** Must match the region where `generateProjectTree` is deployed (v2 default: us-central1). */
const FUNCTIONS_REGION = 'us-central1'


export default function ProjectAIWizard({
  userId,
  title,
  visionPrompt,
  startDate,
  endDate,
  weeklyCommitmentHours,
  tags,
  documentUrls = [],
  onComplete,
}) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const navigate = useNavigate()

  const handleStart = async () => {
    setStatus('creating')
    setError('')
    setProgress('Creating project...')
    try {
      
      const docRef = await addDoc(collection(db, 'projects'), {
        userId,
        schemaVersion: '1.0',
        title,
        visionPrompt,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          startDate,
          endDate,
          weeklyCommitmentHours,
          tags,
          documentUrls,
        },
        progress: {
          nodesCompleted: 0,
          totalNodes: 0,
          growthStage: 0,
        },
      })
      const projectId = docRef.id
      setProgress('Generating roadmap...')
      setStatus('ai')
      
      const functions = getFunctions(app, FUNCTIONS_REGION)
      const generateProjectTree = httpsCallable(functions, 'generateProjectTree')
      await generateProjectTree({
        userPrompt: visionPrompt,
        projectId,
      })
      setProgress('Updating project...')
      setStatus('done')
      if (onComplete) onComplete(projectId)
      else navigate(`/treeview/${projectId}`)
    } catch (err) {
      const code = err?.code
      let message = err?.message || 'Something went wrong'
      if (code === 'functions/not-found') {
        message =
          'Cloud Function not found. Deploy `generateProjectTree` and use region us-central1, or check your Firebase project.'
      } else if (code === 'functions/internal') {
        message =
          'The roadmap generator failed on the server. If you deploy functions yourself, set OPENAI_API_KEY for this project (Firebase params, Cloud Run env, or Secret Manager) and check function logs: firebase functions:log --only generateProjectTree'
      } else if (
        code === 'functions/failed-precondition' ||
        code === 'functions/invalid-argument'
      ) {
        message = err.message || message
      }
      setError(message)
      setStatus('error')
    }
  }

  return (
    <div style={{padding:32, maxWidth:480, margin:'0 auto', textAlign:'center'}}>
      {status === 'idle' && (
        <button className="add-project__start" onClick={handleStart}>
          Generate Project Roadmap
        </button>
      )}
      {status !== 'idle' && (
        <div>
          <div style={{marginBottom:16}}>{progress}</div>
          {status === 'error' && <div style={{color:'red'}}>{error}</div>}
          {status === 'done' && <div style={{color:'green'}}>Project created and AI roadmap generated!</div>}
        </div>
      )}
    </div>
  )
}
