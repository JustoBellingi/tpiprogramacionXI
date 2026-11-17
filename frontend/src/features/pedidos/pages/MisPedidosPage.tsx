import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { formatFecha, formatPrecio } from '../../../shared/types/paginado'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const LIMIT = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const location = useLocation()
  const recienCreado = (location.state as { creado?: boolean } | null)?.creado

  const { data, isPending, isError, error, refetch } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT, mios: true })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = () => {
    if (!aCancelar) return
    cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      {recienCreado && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
          ¡Pedido creado! Te avisamos cuando empiece a prepararse.
        </p>
      )}

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-48 flex-1">
                  <p className="font-semibold">Pedido #{p.id}</p>
                  <p className="text-sm text-stone-500">
                    {formatFecha(p.created_at)} · {p.items.length} {p.items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <BadgeEstado estado={p.estado} />
                <p className="w-28 text-right font-bold">{formatPrecio(p.total)}</p>
                <div className="flex gap-2">
                  <Button variante="secondary" tamano="sm" onClick={() => setDetalleId(p.id)}>
                    Ver detalle
                  </Button>
                  {p.estado === 'PENDIENTE' && (
                    <Button variante="danger" tamano="sm" onClick={() => setACancelar(p)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / LIMIT)} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onClose={() => setDetalleId(null)} ancho="lg">
        {detalleId !== null && <PedidoDetalle pedidoId={detalleId} />}
      </Modal>

      <Modal abierto={aCancelar !== null} titulo="Cancelar pedido" onClose={() => setACancelar(null)}>
        <p className="text-sm text-stone-600">
          ¿Seguro que querés cancelar el pedido #{aCancelar?.id}? Esta acción no se puede deshacer.
        </p>
        <div className="mt-4">
          <MensajeError error={cancelar.error} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secondary" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button variante="danger" onClick={confirmarCancelacion} cargando={cancelar.isPending}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
