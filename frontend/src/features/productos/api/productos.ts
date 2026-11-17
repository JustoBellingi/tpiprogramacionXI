import { api } from '../../../shared/api/axiosInstance'
import type { Paginado } from '../../../shared/types/paginado'
import type { FiltrosProductos, Producto, ProductoInput, ProductoStockUpdate } from '../types/producto'

export async function getProductos(filtros: FiltrosProductos): Promise<Paginado<Producto>> {
  const { data } = await api.get<Paginado<Producto>>('/productos', { params: filtros })
  return data
}

export async function crearProducto(payload: ProductoInput): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', payload)
  return data
}

export async function actualizarProducto(id: number, payload: Partial<ProductoInput>): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload)
  return data
}

export async function actualizarStock(id: number, payload: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, payload)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
