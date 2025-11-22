import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../services/http'
import { fetchShoes } from '../services/shoes'

let mock: MockAdapter
beforeEach(() => {
  mock = new MockAdapter(httpClient)
  mock.reset()
})

describe('fetchShoes', () => {
  it('handles 200 and maps data', async () => {
    mock.onGet('/shoes').reply(200, [{ id: 1, Productname: 'Shoe', price: '1000', image: '/a.jpg' }])
    const data = await fetchShoes()
    expect(data[0].name).toBe('Shoe')
    expect(data[0].price).toBe(1000)
  })

  it('maps nested data array', async () => {
    mock.onGet('/shoes').reply(200, { data: [{ shoe_id: 2, title: 'Runner', amount: '850', image_url: '/b.jpg' }] })
    const data = await fetchShoes()
    expect(data[0].id).toBe(2)
    expect(data[0].name).toBe('Runner')
    expect(data[0].price).toBe(850)
  })

  it('handles 404 as empty array', async () => {
    mock.onGet('/shoes').reply(404)
    const data = await fetchShoes()
    expect(data.length).toBe(0)
  })

  it('handles 500 as error', async () => {
    mock.onGet('/shoes').reply(500)
    await expect(fetchShoes()).rejects.toThrow()
  })

  it('handles timeout', async () => {
    mock.onGet('/shoes').timeout()
    await expect(fetchShoes(10)).rejects.toThrow('Request timeout')
  })
})