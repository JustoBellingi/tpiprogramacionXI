import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../shared/components/DataTable'
import { formatFecha, formatPrecio } from '../../../shared/types/paginado'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { ESTADO_LABEL, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

interface PedidosTableProps {
  pedidos: Pedido[]
  onVerDetalle: (id: number) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
  procesandoId: number | null
}

const etiquetaAccion: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

export function PedidosTable({ pedidos, onVerDetalle, onCambiarEstado, procesandoId }: PedidosTableProps) {
  const columnas: ColumnDef<Pedido>[] = [
    { id: 'id', header: '#', accessorFn: (p) => p.id },
    { id: 'usuario', header: 'Cliente', accessorFn: (p) => p.usuario_id, cell: ({ row }) => `Usuario #${row.original.usuario_id}` },
    { id: 'fecha', header: 'Fecha', accessorFn: (p) => p.created_at, cell: ({ row }) => formatFecha(row.original.created_at) },
    { id: 'pago', header: 'Pago', accessorFn: (p) => p.forma_pago },
    { id: 'total', header: 'Total', accessorFn: (p) => p.total, cell: ({ row }) => formatPrecio(row.original.total) },
    {
      id: 'estado',
      header: 'Estado',
      accessorFn: (p) => ESTADO_LABEL[p.estado],
      cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const pedido = row.original
        return (
          <div className="flex flex-wrap gap-1.5">
            <Button variante="ghost" tamano="sm" onClick={() => onVerDetalle(pedido.id)}>
              Ver
            </Button>
            {TRANSICIONES[pedido.estado].map((destino) => (
              <Button
                key={destino}
                tamano="sm"
                variante={destino === 'CANCELADO' ? 'danger' : 'primary'}
                disabled={procesandoId === pedido.id}
                onClick={() => onCambiarEstado(pedido, destino)}
              >
                {etiquetaAccion[destino]}
              </Button>
            ))}
          </div>
        )
      },
    },
  ]

  return <DataTable datos={pedidos} columnas={columnas} paginar={false} />
}
