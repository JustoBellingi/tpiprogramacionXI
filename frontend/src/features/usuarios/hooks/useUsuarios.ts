import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'

const usuariosKey = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: usuariosKey, queryFn: getUsuarios })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? activarUsuario(id) : desactivarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKey }),
  })
}
