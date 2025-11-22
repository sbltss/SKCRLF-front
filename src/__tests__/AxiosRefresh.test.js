import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import api from '../lib/axios'
import { setTokens, clearTokens } from '../lib/tokenStorage'

let mock
beforeEach(() => {
  mock = new MockAdapter(api)
  mock.reset()
  clearTokens()
})

describe('axios refresh', () => {
  it('refreshes on 401 and retries', async () => {
    setTokens('old', 'refresh', true)
    mock.onGet('/secure').replyOnce(401)
    mock.onPost('/auth/refresh').replyOnce(200, { accessToken: 'new', refreshToken: 'refresh' })
    mock.onGet('/secure').reply(200, { ok: true })
    const res = await api.get('/secure')
    expect(res.data.ok).toBe(true)
  })
})