import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import './Login.css'

export default function Login() {
  const { login, loginLoading, loginError, setRemember, remember, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const { currentUser } = useUserStore()
  useEffect(() => {
    if (currentUser) {
      nav('/shoes', { replace: true })
    } else if (isAuthenticated) {
      const to = loc.state?.from?.pathname || '/'
      nav(to, { replace: true })
    }
  }, [currentUser, isAuthenticated])
  function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!username) errs.username = 'Username is required'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 4) errs.password = 'Password must be at least 4 characters'
    setErrors(errs)
    setTouched(true)
    if (Object.keys(errs).length) return
    login({ username, password, remember }).catch(() => {})
  }
  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true">
        <img src="/loginBg.png" alt="Shoes themed background" aria-hidden="true" className="bg-fallback" width="1920" height="1080" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        <div className="bg-overlay" />
      </div>
      <form data-testid="login-form" onSubmit={submit} className="login-card" aria-label="Login form">
        <h2 className="login-title">Welcome Back</h2>
        <div className="mb-3">
          <label className="form-label" htmlFor="username">Username or Email</label>
          <input
            id="username"
            type="text"
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (!e.target.value) setErrors((p) => ({ ...p, username: 'Username is required' }))
              else setErrors((p) => ({ ...p, username: undefined }))
            }}
            onBlur={() => setTouched(true)}
            required
            aria-invalid={!!errors.username}
            aria-label="Username or Email"
          />
          {touched && errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (!e.target.value) setErrors((p) => ({ ...p, password: 'Password is required' }))
                else if (e.target.value.length < 4) setErrors((p) => ({ ...p, password: 'Password must be at least 4 characters' }))
                else setErrors((p) => ({ ...p, password: undefined }))
              }}
              onBlur={() => setTouched(true)}
              required
              aria-invalid={!!errors.password}
              style={{ transition: 'box-shadow 200ms ease' }}
              aria-label="Password"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {touched && errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} id="remember" />
            <label className="form-check-label" htmlFor="remember">Remember Me</label>
          </div>
          {/* <a href="#" className="text-decoration-none">Forgot Password?</a> */}
        </div>
        {/* <div className="mb-3 d-grid gap-2">
          <button className="btn btn-outline-dark" type="button" aria-label="Continue with Google">Continue with Google</button>
        </div> */}
        <button
          className="btn btn-dark w-100"
          type="submit"
          disabled={loginLoading}
          style={{ transition: 'opacity 200ms ease' }}
        >
          {loginLoading ? 'Signing in…' : 'Sign In'}
        </button>
        {loginError && <div className="alert alert-danger mt-3">Invalid credentials or server error</div>}
      </form>
    </div>
  )
}