import React from 'react'

import { Outlet, Route, Routes } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth'
import Auth from '../pages/LogIn'
import SignUp from '../pages/SignUp'
import BlankDashboard from '../pages/BlankDashboard'
import PlantNextAdventure from '../pages/PlantNextAdventure'

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
        <Route index element={<BlankDashboard />} />
        <Route path="plant-your-next-adventure" element={<PlantNextAdventure />} />
      </Route>
    </Routes>
  )
}

export default App
