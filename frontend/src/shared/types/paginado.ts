export interface Paginado<T> {
  total: number
  items: T[]
}

export const formatPrecio = (valor: number): string =>
  valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export const formatFecha = (iso: string): string =>  new Date(iso.endsWith('Z') ? iso : `${iso}Z`).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
