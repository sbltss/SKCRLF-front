import { useAuth } from '../auth/AuthProvider'

export default function Account() {
  const { user, logout } = useAuth()
  return (
    <div className="container py-5">
      <h2 className="mb-3">Account</h2>
      <div className="mb-3">{user ? JSON.stringify(user) : 'No profile'}</div>
      <button className="btn btn-outline-dark" onClick={() => logout()}>Logout</button>
    </div>
  )
}