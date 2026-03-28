import { Handle, Position } from 'reactflow'
import { useTreeViewActions } from './TreeViewActionsContext.js'

export default function ActionableTaskNode({ id, data }) {
  const actions = useTreeViewActions()
  const label = data?.label ?? 'Task'
  const xp = data?.xp_value ?? 0
  const resources = Array.isArray(data?.resources) ? data.resources : []
  const done = data?.status === 'completed'

  return (
    <div className={`tree-node ${done ? 'tree-node--done' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="tree-node__header">
        <span className="tree-node__xp">+{xp} XP</span>
        {done && <span className="tree-node__badge">Done</span>}
      </div>
      <p className="tree-node__label">{label}</p>
      {resources.length > 0 && (
        <ul className="tree-node__resources">
          {resources.slice(0, 4).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      {actions?.onToggleComplete && (
        <button
          type="button"
          className="tree-node__btn"
          onClick={() => actions.onToggleComplete(id)}
        >
          {done ? 'Mark incomplete' : 'Mark complete'}
        </button>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
