import '../styles/TreeView.css'
import 'reactflow/dist/style.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow'
import { auth, db } from '../firebase.js'
import BottomNav from '../components/BottomNav'
import ActionableTaskNode from '../components/ActionableTaskNode.js'
import { TreeViewActionsContext } from '../components/TreeViewActionsContext.js'
import {
  buildReactFlowState,
  extractFlowFromProject,
} from '../utils/projectFlowData.js'

const nodeTypes = { actionableTask: ActionableTaskNode }

function FitViewHelper({ nodeCount }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    if (nodeCount > 0) {
      const t = requestAnimationFrame(() => {
        fitView({ padding: 0.25, duration: 280 })
      })
      return () => cancelAnimationFrame(t)
    }
  }, [nodeCount, fitView])
  return null
}

function TreeViewFlow({ project, onToggleComplete }) {
  const navigate = useNavigate()
  const { nodes: initialNodes, metadata } = buildReactFlowState(project)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildReactFlowState(project).edges
  )

  useEffect(() => {
    const { nodes: n, edges: e } = buildReactFlowState(project)
    setNodes(n)
    setEdges(e)
  }, [project, setNodes, setEdges])

  const actionsValue = useMemo(
    () => ({ onToggleComplete }),
    [onToggleComplete]
  )

  const assessment = metadata?.ai_assessment

  return (
    <TreeViewActionsContext.Provider value={actionsValue}>
      <div className="treeview-page__header">
        <button
          type="button"
          className="treeview-page__back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="treeview-page__title-block">
          <h1 className="treeview-page__title">
            {metadata?.title || project.title || 'Project roadmap'}
          </h1>
          {assessment && (
            <p className="treeview-page__subtitle">{assessment}</p>
          )}
          <div className="treeview-page__progress">
            Progress: {project.progress?.nodesCompleted ?? 0} /{' '}
            {project.progress?.totalNodes ||
              metadata?.total_nodes ||
              initialNodes.length ||
              '—'}{' '}
            steps
          </div>
        </div>
      </div>

      <div className="treeview-page__flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <FitViewHelper nodeCount={nodes.length} />
          <Background color="#c5e3d0" gap={20} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            style={{ borderRadius: 8 }}
          />
        </ReactFlow>
      </div>
    </TreeViewActionsContext.Provider>
  )
}

/** Loads one project doc; remount via `key` when project or user changes so snapshot state resets without setState in effects. */
function TreeViewForProject({ projectId, user }) {
  const [project, setProject] = useState(null)
  const [loadState, setLoadState] = useState('loading')

  useEffect(() => {
    const ref = doc(db, 'projects', projectId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists) {
          setProject(null)
          setLoadState('missing')
          return
        }
        const data = snap.data()
        if (data.userId !== user.uid) {
          setLoadState('denied')
          return
        }
        setProject({ id: snap.id, ...data })
        setLoadState('ready')
      },
      () => setLoadState('error')
    )
    return () => unsub()
  }, [projectId, user])

  useEffect(() => {
    if (!project || loadState !== 'ready') return
    const { nodes, metadata } = extractFlowFromProject(project)
    const total = metadata?.total_nodes ?? nodes.length
    if (total > 0 && (project.progress?.totalNodes ?? 0) === 0) {
      updateDoc(doc(db, 'projects', projectId), {
        'progress.totalNodes': total,
        updatedAt: serverTimestamp(),
      }).catch(() => {})
    }
  }, [project, projectId, loadState])

  const onToggleComplete = useCallback(
    async (nodeId) => {
      if (!project) return
      const prev = project.progress?.completedNodeIds ?? []
      const set = new Set(prev)
      if (set.has(nodeId)) set.delete(nodeId)
      else set.add(nodeId)
      const completedNodeIds = [...set]
      try {
        await updateDoc(doc(db, 'projects', projectId), {
          'progress.completedNodeIds': completedNodeIds,
          'progress.nodesCompleted': completedNodeIds.length,
          updatedAt: serverTimestamp(),
        })
      } catch (e) {
        console.error('TreeView update progress:', e)
      }
    },
    [project, projectId]
  )

  if (loadState === 'loading') {
    return (
      <div className="treeview-page__state">Loading project roadmap…</div>
    )
  }
  if (loadState === 'missing') {
    return (
      <div className="treeview-page__state">
        This project could not be found.
      </div>
    )
  }
  if (loadState === 'denied') {
    return (
      <div className="treeview-page__state treeview-page__state--error">
        You do not have access to this project.
      </div>
    )
  }
  if (loadState === 'error') {
    return (
      <div className="treeview-page__state treeview-page__state--error">
        Something went wrong loading this project.
      </div>
    )
  }
  if (!project?.reactFlowData) {
    return (
      <div className="treeview-page__state">
        No roadmap yet. Generate one from the project wizard first.
      </div>
    )
  }
  const { nodes } = buildReactFlowState(project)
  if (nodes.length === 0) {
    return (
      <div className="treeview-page__state">
        Roadmap data is empty. Try generating the tree again.
      </div>
    )
  }
  return (
    <ReactFlowProvider>
      <TreeViewFlow project={project} onToggleComplete={onToggleComplete} />
    </ReactFlowProvider>
  )
}

export default function TreeView() {
  const { projectId } = useParams()
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  let body
  if (user === undefined) {
    body = (
      <div className="treeview-page__state">Loading project roadmap…</div>
    )
  } else if (user === null) {
    body = (
      <div className="treeview-page__state">
        Sign in to view this roadmap.
      </div>
    )
  } else if (!projectId) {
    body = (
      <div className="treeview-page__state">Missing project id.</div>
    )
  } else {
    body = (
      <TreeViewForProject
        key={`${projectId}-${user.uid}`}
        projectId={projectId}
        user={user}
      />
    )
  }

  return (
    <div className="treeview-page">
      {body}
      <BottomNav />
    </div>
  )
}
