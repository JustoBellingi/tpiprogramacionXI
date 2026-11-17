import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias'
import type { CategoriaInput } from '../types/categoria'

export const categoriasKey = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: categoriasKey, queryFn: getCategorias })
}

export function useGuardarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CategoriaInput }) =>
      id ? actualizarCategoria(id, data) : crearCategoria(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKey }),
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKey }),
  })
}
