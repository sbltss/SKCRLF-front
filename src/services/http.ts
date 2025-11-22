import axios, { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'

export type ApiResponse<T> = {
  data: T
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8080',
  withCredentials: true,
})

export async function getFromApi<T>(path: string): Promise<T> {
  try {
    const res = await httpClient.get<T>(path)
    return res.data
  } catch (e) {
    const err = e as AxiosError
    throw new Error(err.message || 'Request failed')
  }
}

export function useApiGet<T>(path: string, enabled = true) {
  return useQuery({
    queryKey: ['api', path],
    queryFn: () => getFromApi<T>(path),
    enabled,
    retry: 1,
  })
}

/**
 * Backend CORS requirements:
 * - Access-Control-Allow-Origin: http://localhost:5173 (vite dev)
 * - Access-Control-Allow-Credentials: true
 * - Access-Control-Allow-Headers: content-type, authorization
 * - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
 */