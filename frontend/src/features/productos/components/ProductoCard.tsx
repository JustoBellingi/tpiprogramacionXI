import { useState } from 'react'
import { formatPrecio } from '../../../shared/types/paginado'
import { Button } from '../../../shared/ui/Button'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [agregado, setAgregado] = useState(false)

  const sinStock = producto.stock <= 0
  const vendible = producto.disponible && !sinStock
  const alcanzoStock = enCarrito >= producto.stock

  const onAgregar = () => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1200)
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 transition hover:shadow-md">
      {/* Recuadro fijo 3:2. La imagen va en absolute para que su tamaño real no estire la tarjeta. */}
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-stone-100">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl">🍽️</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-700">
          {producto.categoria.nombre}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-tight">{producto.nombre}</h3>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-lg font-bold text-brand-700">{formatPrecio(producto.precio_base)}</p>
          <p className={`text-xs ${vendible ? 'text-stone-500' : 'text-red-600'}`}>
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </p>
        </div>
        <Button onClick={onAgregar} disabled={!vendible || alcanzoStock} className="w-full">
          {agregado ? '✓ Agregado' : alcanzoStock && vendible ? 'Máximo en carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </article>
  )
}
