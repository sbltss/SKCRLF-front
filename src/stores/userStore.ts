import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrentUser = {
  user_id: number
  username: string
  role: string | null
}

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
      setUser: (user) => {
        set({ currentUser: user })
        try { localStorage.setItem('currentUser', JSON.stringify(user)) } catch {}
      },
      updateUser: (partial) => {
        const curr = get().currentUser
        if (!curr) return
        const next = { ...curr, ...partial }
        set({ currentUser: next })
        try { localStorage.setItem('currentUser', JSON.stringify(next)) } catch {}
      },
      clearUser: () => {
        set({ currentUser: null })
        try { localStorage.removeItem('currentUser') } catch {}
      },
    }),
    { name: 'userStore' }
  )
)