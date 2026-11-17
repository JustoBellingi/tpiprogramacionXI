import { ESTADO_LABEL, type EstadoPedido } from '../../features/pedidos/types/pedido'

const colores: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 ring-amber-200',
  EN_PREPARACION: 'bg-sky-100 text-sky-800 ring-sky-200',
  ENTREGADO: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  CANCELADO: 'bg-stone-200 text-stone-600 ring-stone-300',
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${colores[estado]}`}>
      {ESTADO_LABEL[estado]}
    </span>
  )
}
