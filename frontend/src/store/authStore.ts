import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getMe, loginRequest, logoutRequest } from '../features/auth/api/auth'
import type { Usuario } from '../features/auth/types/auth'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password) 
        const usuario = await getMe()
        set({ usuario, cargando: false })
        return usuario
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await getMe()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiar: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
