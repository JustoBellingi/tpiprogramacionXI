import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../../store/authStore'
import { CUENTA_DESACTIVADA } from './handleApiError'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail

    const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta))
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA

    if (sesionVencida || cuentaDesactivada) {
      useAuthStore.getState().limpiar()
    }
    return Promise.reject(error)
  },
)
