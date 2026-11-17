import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedido,
  getPedidos,
  getResumen,
} from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null, 
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: getResumen })
}
function useInvalidarTrasPedido() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
      queryClient.invalidateQueries({ queryKey: ['pedido'] }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarTrasPedido()
  return useMutation({ mutationFn: crearPedido, onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarTrasPedido()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarTrasPedido()
  return useMutation({ mutationFn: cancelarPedido, onSuccess: invalidar })
}
