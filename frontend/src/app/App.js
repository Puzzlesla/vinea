import React from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth'
import Auth from '../pages/LogIn'
import SignUp from '../pages/SignUp'
import DashboardOrBlank from '../pages/DashboardOrBlank'
import TreeView from '../pages/TreeView'
import PlantNextAdventure from '../pages/PlantNextAdventure'
import CompletedProjects from '../pages/CompletedProjects'

function DashboardLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOrBlank />} />
        <Route path="plant-your-next-adventure" element={<PlantNextAdventure />} />
        <Route path="completed" element={<CompletedProjects />} />
      </Route>
      <Route path="/treeview/:projectId" element={<TreeView />} />
    </Routes>
  )
}

export default App
