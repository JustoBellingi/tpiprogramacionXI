import { useState } from 'react'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Select } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { PedidosTable } from '../components/PedidosTable'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADO_LABEL, ESTADOS, type EstadoPedido, type Pedido } from '../types/pedido'

const LIMIT = 20

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [cancelacion, setCancelacion] = useState<Pedido | null>(null)

  const { data, isPending, isError, error, refetch } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const onCambiarEstado = (pedido: Pedido, destino: EstadoPedido) => {
    if (destino === 'CANCELADO') {
      setCancelacion(pedido)
      return
    }
    cambiarEstado.mutate({ id: pedido.id, estado: destino })
  }

  const confirmarCancelacion = () => {
    if (!cancelacion) return
    cambiarEstado.mutate({ id: cancelacion.id, estado: 'CANCELADO' }, { onSuccess: () => setCancelacion(null) })
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Select
          value={estado ?? ''}
          onChange={(e) => {
            setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)
            setPagina(0)
          }}
          className="max-w-xs"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </Select>
      </div>

      {!cancelacion && <MensajeError error={cambiarEstado.error} />}

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <>
          <p className="text-sm text-stone-500">{data.total} pedidos</p>
          <PedidosTable
            pedidos={data.items}
            onVerDetalle={setDetalleId}
            onCambiarEstado={onCambiarEstado}
            procesandoId={cambiarEstado.isPending ? (cambiarEstado.variables?.id ?? null) : null}
          />
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / LIMIT)} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onClose={() => setDetalleId(null)} ancho="lg">
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>

      <Modal abierto={cancelacion !== null} titulo="Cancelar pedido" onClose={() => setCancelacion(null)}>
        <p className="text-sm text-stone-600">
          ¿Cancelar el pedido #{cancelacion?.id}? Se va a restituir el stock de sus productos.
        </p>
        <div className="mt-4">
          <MensajeError error={cambiarEstado.error} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secondary" onClick={() => setCancelacion(null)}>
            Volver
          </Button>
          <Button variante="danger" onClick={confirmarCancelacion} cargando={cambiarEstado.isPending}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
