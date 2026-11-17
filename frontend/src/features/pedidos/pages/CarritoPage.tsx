import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { formatPrecio } from '../../../shared/types/paginado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total)()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Ver catálogo
          </Link>
        }
      />
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Carrito</h1>
          <Button variante="ghost" tamano="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </div>
        {items.map((item) => (
          <Card key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium">{item.nombre}</p>
              <p className="text-sm text-stone-500">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variante="secondary" tamano="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)} aria-label="Restar">
                −
              </Button>
              <span className="w-8 text-center font-medium">{item.cantidad}</span>
              <Button variante="secondary" tamano="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)} aria-label="Sumar">
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
            <button onClick={() => quitar(item.producto_id)} className="text-sm text-red-600 hover:underline">
              Quitar
            </button>
          </Card>
        ))}
      </div>

      <Card className="h-fit space-y-4 p-6">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="flex justify-between text-sm">
          <span>Productos</span>
          <span>{items.reduce((a, i) => a + i.cantidad, 0)}</span>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrecio(total)}</span>
        </div>
        <p className="text-xs text-stone-500">El precio y el stock se confirman al crear el pedido.</p>
        <Button className="w-full" onClick={() => navigate('/checkout')}>
          Confirmar pedido
        </Button>
      </Card>
    </section>
  )
}
