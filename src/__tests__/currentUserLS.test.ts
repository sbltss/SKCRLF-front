import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore, type CurrentUser } from '../stores/userStore'

beforeEach(() => {
  localStorage.clear()
  useUserStore.setState({ currentUser: null })
})

describe('currentUser localStorage', () => {
  it('writes currentUser on setUser', () => {
    const user: CurrentUser = { user_id: 6, username: 'Clrkk', role: null }
    useUserStore.getState().setUser(user)
    const raw = localStorage.getItem('currentUser')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string)
    expect(parsed.user_id).toBe(6)
  })

  it('removes currentUser on clearUser', () => {
    const user: CurrentUser = { user_id: 1, username: 'u', role: null }
    useUserStore.getState().setUser(user)
    useUserStore.getState().clearUser()
    expect(localStorage.getItem('currentUser')).toBeNull()
  })
})