import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { formatFecha, formatPrecio } from '../../../shared/types/paginado'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { usePedido } from '../hooks/usePedidos'
export function PedidoDetalle({ pedidoId }: { pedidoId: number }) {
  const { data: pedido, isPending, isError, error } = usePedido(pedidoId)

  if (isPending) return <SkeletonFilas filas={4} />
  if (isError) return <EstadoError error={error} />

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-stone-500">Creado: {formatFecha(pedido.created_at)}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-stone-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="text-stone-500">Pago</dt>
        <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        {pedido.notas && (
          <>
            <dt className="text-stone-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
        <dt className="text-stone-500">Actualizado</dt>
        <dd>{formatFecha(pedido.updated_at)}</dd>
      </dl>
      <table className="w-full">
        <thead className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((linea) => (
            <tr key={linea.producto_id}>
              <td className="py-2">{linea.nombre_producto}</td>
              <td className="py-2 text-right">{formatPrecio(linea.precio_unitario)}</td>
              <td className="py-2 text-right">{linea.cantidad}</td>
              <td className="py-2 text-right">{formatPrecio(linea.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200 font-bold">
            <td colSpan={3} className="py-2">
              Total
            </td>
            <td className="py-2 text-right">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
