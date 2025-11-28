// Auth context and providers: handles login/logout and exposes auth state
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { login as loginFn, logout as logoutFn } from '../services/auth'
import { useUserStore } from '../stores/userStore'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

/**
 * AuthProvider wraps children with authentication state and actions.
 * Exposes: user, isAuthenticated, login/logout, remember flag controls.
 */
export function AuthProvider({ children }) {
  const [remember, setRemember] = useState(true)
  const { currentUser, setUser, clearUser } = useUserStore()
  const navigate = useNavigate()
  // Login mutation: calls backend and updates user store via services/auth
  const m = useMutation({
    mutationFn: ({ username, password, remember: r }) => loginFn({ username, password, remember: r }),
    onSuccess: () => {},
  })
  // Logout mutation: clears store/tokens and redirects to login
  const l = useMutation({ mutationFn: logoutFn, onSuccess: () => { clearUser(); navigate('/login', { replace: true }) } })
  const value = useMemo(
    () => ({
      user: currentUser || null,
      isAuthenticated: !!(currentUser && typeof currentUser.user_id === 'number'),
      login: m.mutateAsync,
      loginLoading: m.isPending,
      loginError: m.error,
      logout: l.mutateAsync,
      setRemember,
      remember,
    }),
    [currentUser, m.isPending, m.error, l.mutateAsync, remember]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to consume the auth context
export function useAuth() {
  return useContext(AuthContext)
}

const qc = new QueryClient()

/**
 * AppProviders sets up React Query and wraps the app with AuthProvider.
 */
export function AppProviders({ children }) {
  return <QueryClientProvider client={qc}><AuthProvider>{children}</AuthProvider></QueryClientProvider>
}
