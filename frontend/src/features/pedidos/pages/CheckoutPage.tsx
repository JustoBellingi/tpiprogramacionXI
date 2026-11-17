import { Navigate, useNavigate } from 'react-router-dom'
import { formatPrecio } from '../../../shared/types/paginado'
import { Card } from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)()
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />

  const confirmar = (datos: DatosCheckout) => {
    crearPedido.mutate(
      {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      },
      {
        onSuccess: () => {
          vaciar()
          navigate('/mis-pedidos', { replace: true, state: { creado: true } })
        },
      },
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <Card className="p-6 lg:col-span-3">
        <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
        <CheckoutForm onConfirmar={confirmar} enviando={crearPedido.isPending} error={crearPedido.error} />
      </Card>
      <Card className="h-fit p-6 lg:col-span-2">
        <h2 className="mb-4 font-semibold">Tu pedido</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between gap-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrecio(total)}</span>
        </div>
        <p className="mt-2 text-xs text-stone-500">Pago manual al recibir (efectivo) o por transferencia.</p>
      </Card>
    </section>
  )
}
