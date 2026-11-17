import { useForm } from '@tanstack/react-form'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Campo, Input } from '../../../shared/ui/Input'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onGuardar: (data: ProductoStockUpdate) => void
  onCancelar: () => void
  guardando: boolean
  error: unknown
}
export function StockForm({ producto, onGuardar, onCancelar, guardando, error }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar(value),
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero mayor o igual a 0'),
        }}
      >
        {(field) => (
          <Campo label="Stock" errores={field.state.meta.errors}>
            <Input type="number" min={0} step={1} value={field.state.value} onChange={(e) => field.handleChange(e.target.valueAsNumber)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 accent-brand-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <MensajeError error={error} />

      <div className="flex justify-end gap-2">
        <Button type="button" variante="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit} cargando={guardando}>
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
