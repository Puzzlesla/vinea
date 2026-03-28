import { createContext, useContext } from 'react'

export const TreeViewActionsContext = createContext(null)

export function useTreeViewActions() {
  return useContext(TreeViewActionsContext)
}
