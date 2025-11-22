import { Navigate, Outlet, useLocation } from 'react-router-dom'

function hasStoredUser() {
  try {
    const raw = localStorage.getItem('userStore')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    const u = parsed?.state?.currentUser
    return !!(u && typeof u.user_id === 'number')
  } catch {
    return false
  }
}

export default function UserStoreGuard() {
  const loc = useLocation()
  const ok = hasStoredUser()
  if (!ok) return <Navigate to="/login" replace state={{ from: loc }} />
  return <Outlet />
}