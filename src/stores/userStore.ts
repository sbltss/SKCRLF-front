// Global user store using zustand with persistence
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Shape of the authenticated user maintained in the client.
 */
export type CurrentUser = {
  user_id: number
  username: string
  role: string | null
}

/**
 * Store state and actions.
 */
type UserState = {
  currentUser: CurrentUser | null
  setUser: (user: CurrentUser) => void
  updateUser: (partial: Partial<CurrentUser>) => void
  clearUser: () => void
}

/**
 * Usage:
 * const { currentUser, setUser, updateUser, clearUser } = useUserStore()
 * setUser({ id: '1', email: 'x@y.com' })
 * updateUser({ name: 'Alex' })
 * clearUser()
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      // Replace current user and persist to localStorage
      setUser: (user) => {
        set({ currentUser: user })
        try { localStorage.setItem('currentUser', JSON.stringify(user)) } catch {}
      },
      // Shallow merge partial updates and persist
      updateUser: (partial) => {
        const curr = get().currentUser
        if (!curr) return
        const next = { ...curr, ...partial }
        set({ currentUser: next })
        try { localStorage.setItem('currentUser', JSON.stringify(next)) } catch {}
      },
      // Clear current user and remove persisted entry
      clearUser: () => {
        set({ currentUser: null })
        try { localStorage.removeItem('currentUser') } catch {}
      },
    }),
    { name: 'userStore' }
  )
)
