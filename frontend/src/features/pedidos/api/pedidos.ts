import { api } from '../../../shared/api/axiosInstance'
import type { Paginado } from '../../../shared/types/paginado'
import type { EstadoPedido, FiltrosPedidos, Pedido, PedidoCreate, ResumenPedidos } from '../types/pedido'

export async function getPedidos(filtros: FiltrosPedidos): Promise<Paginado<Pedido>> {
  const { data } = await api.get<Paginado<Pedido>>('/pedidos', { params: filtros })
  return data
}

export async function getPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`)
  return data
}

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', payload)
  return data
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen')
  return data
}
