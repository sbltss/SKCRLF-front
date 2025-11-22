import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { AppProviders } from '../auth/AuthProvider'
import { MemoryRouter } from 'react-router-dom'
import { getAccessToken, loadFromStorage } from '../lib/tokenStorage'

beforeEach(() => {})

describe('session persistence', () => {
  it('loads tokens and rehydrates currentUser store', async () => {
    localStorage.setItem('remember_me', 'true')
    localStorage.setItem('access_token', 'a')
    localStorage.setItem('refresh_token', 'r')
    localStorage.setItem('userStore', JSON.stringify({ state: { currentUser: { role: null, user_id: 1, username: 'x' } } }))
    loadFromStorage()
    render(
      <MemoryRouter>
        <AppProviders><div /></AppProviders>
      </MemoryRouter>
    )
    expect(getAccessToken()).toBe('a')
  })
})