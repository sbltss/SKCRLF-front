import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../services/http'
import { login } from '../services/auth'
import { useUserStore } from '../stores/userStore'

let mock: MockAdapter
beforeEach(() => {
  mock = new MockAdapter(httpClient)
  mock.reset()
  localStorage.clear()
  useUserStore.setState({ currentUser: null })
})

describe('login immediate userStore update', () => {
  it('updates userStore synchronously after login', async () => {
    mock.onPost('/users/login').reply(200, {
      accessToken: 'a',
      refreshToken: 'r',
      user: { role: null, user_id: 6, username: 'Clrkk' },
    })
    await login({ username: 'Clrkk', password: 'x', remember: true })
    const raw = localStorage.getItem('userStore')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string)
    expect(parsed.state.currentUser).toEqual({ role: null, user_id: 6, username: 'Clrkk' })
  })

  it('throws when structure invalid', async () => {
    mock.onPost('/users/login').reply(200, { accessToken: 'a', refreshToken: 'r', user: {} })
    await expect(login({ username: 'u', password: 'x', remember: true })).rejects.toThrow()
  })
})