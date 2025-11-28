// Application shell: defines top-level layout and routes
import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './Components/Nav/Nav'
import Index from './Components/Nav/Pages/Index'
import Login from './pages/Login'
import ProtectedRoute from './auth/ProtectedRoute'
import Account from './pages/Account'
import UserStoreGuard from './auth/UserStoreGuard'
import Shoes from './pages/Shoes'
import { useAuth } from './auth/AuthProvider'

function App() {
  const { isAuthenticated } = useAuth() || { isAuthenticated: false }
  const loc = useLocation()
  const showNav = !!isAuthenticated
  return (
    <>
      {/* Show Nav only when authenticated */}
      {showNav && <Nav />}
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Guard routes that require a persisted user in the store */}
        <Route element={<UserStoreGuard />}>
          <Route path="/shoes" element={<Shoes />} />
          {/* Additional auth check for protected pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
