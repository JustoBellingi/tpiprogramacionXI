import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/types/paginado'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos()

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Resumen del negocio</h1>
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Ingresos (entregados)" valor={formatPrecio(data.ingresos_entregados)} icono="💰" acento="bg-emerald-100 text-emerald-700" />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} icono="📅" />
          <ResumenCard titulo="Pendientes" valor={data.pendientes} icono="⏳" acento="bg-amber-100 text-amber-700" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} icono="👨‍🍳" acento="bg-sky-100 text-sky-700" />
          <ResumenCard titulo="Entregados" valor={data.entregados} icono="✅" acento="bg-emerald-100 text-emerald-700" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} icono="✖️" acento="bg-stone-200 text-stone-600" />
        </div>
      )}
    </section>
  )
}
