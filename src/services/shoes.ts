import { useQuery } from '@tanstack/react-query'
import { httpClient } from './http'

export type Shoe = {
  id: number
  name: string
  price: number
  image: string
  tag?: string
  category?: string
}

function normalize(input: any): Shoe | null {
  if (!input) return null
  const idRaw = input.id ?? input.shoe_id ?? input.product_id
  const id = Number(idRaw)
  const nameRaw = input.name ?? input.Productname ?? input.productname ?? input.title ?? input.Name
  const name = nameRaw ? String(nameRaw) : ''
  const priceRaw = input.price ?? input.Price ?? input.amount ?? input.cost
  const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw))
  const imageRaw = input.image ?? input.imageUrl ?? input.image_url ?? input.img ?? input.picture ?? input.photo
  const image = imageRaw ? String(imageRaw) : ''
  if (!id || !name) return null
  return { id, name, price: Number.isNaN(price) ? 0 : price, image, tag: input.tag ?? input.category_tag ?? input.label, category: input.category ?? input.type }
}

export async function fetchShoes(timeoutMs = 8000, signal?: AbortSignal): Promise<Shoe[]> {
  try {
    const res = await httpClient.get('/shoes', { timeout: timeoutMs, validateStatus: () => true, signal })
    const status = res.status
    if (status === 200) {
      console.log(res, "RES")
      const d = res.data
      return d
    }
    if (status === 404) return []
    const err = new Error(`Request failed with status ${status}`)
    throw err
  } catch (e: any) {
    if (e?.code === 'ECONNABORTED') {
      console.error('Request timeout')
      throw new Error('Request timeout')
    }
    if (e?.name === 'CanceledError' || e?.message === 'canceled') {
      console.error('Request canceled')
      throw new Error('Request canceled')
    }
    console.error('Network or server error')
    throw new Error('Network or server error')
  }
}

export function useShoes(enabled = true, timeoutMs = 8000) {
  return useQuery({ queryKey: ['api', 'shoes'], queryFn: ({ signal }) => fetchShoes(timeoutMs, signal as AbortSignal), enabled, retry: 1 })
}

export async function fetchAllShoes(options?: { timeoutMs?: number; signal?: AbortSignal }) {
  const t = options?.timeoutMs ?? 8000
  return fetchShoes(t, options?.signal)
}