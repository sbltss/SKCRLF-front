import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { httpClient, getFromApi } from '../services/http'

let mock: MockAdapter
beforeEach(() => {
  mock = new MockAdapter(httpClient)
  mock.reset()
})

describe('http GET', () => {
  it('returns data on success', async () => {
    mock.onGet('/users').reply(200, [{ id: 1 }])
    const data = await getFromApi<any[]>('/users')
    expect(data[0].id).toBe(1)
  })

  it('throws error on failure', async () => {
    mock.onGet('/error').reply(500)
    await expect(getFromApi('/error')).rejects.toThrow()
  })
})