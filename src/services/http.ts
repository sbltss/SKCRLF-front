// Lightweight HTTP client and React Query helpers for local API
import axios, { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'

// Generic API response wrapper
export type ApiResponse<T> = {
  data: T
}

// Axios instance targeting local backend
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8080',
  withCredentials: true,
})

// Typed GET helper with basic error normalization
export async function getFromApi<T>(path: string): Promise<T> {
  try {
    const res = await httpClient.get<T>(path)
    return res.data
  } catch (e) {
    const err = e as AxiosError
    throw new Error(err.message || 'Request failed')
  }
}

// React Query hook for simple GET requests
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
