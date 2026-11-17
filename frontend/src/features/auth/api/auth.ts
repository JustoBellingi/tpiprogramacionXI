import { api } from '../../../shared/api/axiosInstance'
import type { UserCreate, Usuario } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<void> {
  const form = new URLSearchParams({ username, password })
  await api.post('/auth/token', form)
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout')
}

export async function getMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function registerRequest(payload: UserCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', payload)
  return data
}
