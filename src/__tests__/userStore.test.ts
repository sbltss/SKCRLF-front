import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore, type CurrentUser } from '../stores/userStore'

beforeEach(() => {
  localStorage.clear()
  useUserStore.setState({ currentUser: null })
})

describe('userStore persistence', () => {
  it('persists currentUser to localStorage', () => {
    const user: CurrentUser = { user_id: 6, username: 'Clrkk', role: null }
    useUserStore.getState().setUser(user)
    const raw = localStorage.getItem('userStore')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string)
    expect(parsed.state.currentUser.username).toBe('Clrkk')
    expect(parsed.state.currentUser.user_id).toBe(6)
  })

  it('rehydrates from localStorage', async () => {
    const user: CurrentUser = { user_id: 2, username: 'charlie', role: null }
    localStorage.setItem('userStore', JSON.stringify({ state: { currentUser: user } }))
    await useUserStore.persist.rehydrate()
    expect(useUserStore.getState().currentUser?.user_id).toBe(2)
  })
})