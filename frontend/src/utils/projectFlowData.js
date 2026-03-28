/**
 * Read roadmap graph from a Firestore project document.
 * Backend stores full AI JSON under `reactFlowData`, which includes nested
 * `reactFlowData: { nodes, edges }` plus `project_metadata`.
 */
export function extractFlowFromProject(doc) {
  if (!doc?.reactFlowData) {
    return { nodes: [], edges: [], metadata: null }
  }
  const outer = doc.reactFlowData
  const metadata = outer.project_metadata ?? null

  if (outer.reactFlowData && Array.isArray(outer.reactFlowData.nodes)) {
    return {
      nodes: outer.reactFlowData.nodes,
      edges: outer.reactFlowData.edges ?? [],
      metadata,
    }
  }

  if (Array.isArray(outer.nodes)) {
    return {
      nodes: outer.nodes,
      edges: outer.edges ?? [],
      metadata,
    }
  }

  return { nodes: [], edges: [], metadata }
}

export function applyNodeCompletion(nodes, completedIds = []) {
  const done = new Set(completedIds)
  return nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      status: done.has(n.id)
        ? 'completed'
        : (n.data?.status ?? 'pending'),
    },
  }))
}

export function buildReactFlowState(project) {
  const { nodes: rawNodes, edges: rawEdges, metadata } =
    extractFlowFromProject(project)
  const completedIds = project.progress?.completedNodeIds ?? []
  const nodes = applyNodeCompletion(rawNodes, completedIds).map((n) => ({
    ...n,
    type: n.type || 'actionableTask',
    position: n.position ?? { x: 0, y: 0 },
  }))
  const edges = (rawEdges ?? []).map((e) => ({
    ...e,
    animated: e.animated !== false,
  }))
  return { nodes, edges, metadata }
}
