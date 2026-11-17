import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoInput, ProductoStockUpdate } from '../types/producto'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),    placeholderData: keepPreviousData,
  })
}
function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export function useGuardarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductoInput }) =>
      id ? actualizarProducto(id, data) : crearProducto(data),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) => actualizarStock(id, data),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: eliminarProducto, onSuccess: invalidar })
}
