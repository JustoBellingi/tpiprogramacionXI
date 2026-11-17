import { useForm } from '@tanstack/react-form'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Campo, Input, Textarea } from '../../../shared/ui/Input'
import type { Categoria, CategoriaInput } from '../types/categoria'

interface CategoriaFormProps {
  inicial?: Categoria
  onGuardar: (data: CategoriaInput) => void
  onCancelar: () => void
  guardando: boolean
  error: unknown
}

export function CategoriaForm({ inicial, onGuardar, onCancelar, guardando, error }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 2 ? 'Mínimo 2 caracteres' : largo > 100 ? 'Máximo 100 caracteres' : undefined
          },
        }}
      >
        {(field) => (
          <Campo label="Nombre" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
            <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Campo label="Descripción">
            <Textarea rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
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
