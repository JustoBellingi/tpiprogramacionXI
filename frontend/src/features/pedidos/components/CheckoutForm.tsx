import { useForm } from '@tanstack/react-form'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Campo, Input, Select, Textarea } from '../../../shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => void
  enviando: boolean
  error: unknown
}

export function CheckoutForm({ onConfirmar, enviando, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) => onConfirmar(value),
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'Máximo 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Campo label="Dirección de entrega" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
            <Input
              placeholder="Calle, número, piso, ciudad"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Campo label="Forma de pago">
            <Select value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Campo label="Notas (opcional)" errores={field.state.meta.errors}>
            <Textarea
              rows={3}
              placeholder="Ej.: tocar timbre B, sin cebolla…"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Campo>
        )}
      </form.Field>

      <MensajeError error={error} />

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
