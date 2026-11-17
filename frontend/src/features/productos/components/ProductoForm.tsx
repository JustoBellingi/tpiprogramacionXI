import { useForm } from '@tanstack/react-form'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Campo, Input, Select, Textarea } from '../../../shared/ui/Input'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoInput } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto
  categorias: Categoria[]
  onGuardar: (data: ProductoInput) => void
  onCancelar: () => void
  guardando: boolean
  error: unknown
}

export function ProductoForm({ inicial, categorias, onGuardar, onCancelar, guardando, error }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial?.categoria_id ?? categorias[0]?.id ?? 0,
    },
    onSubmit: ({ value }) =>
      onGuardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      }),
  })

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="sm:col-span-2">
        <form.Field
          name="nombre"
          validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
        >
          {(field) => (
            <Campo label="Nombre" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
              <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
      </div>

      <div className="sm:col-span-2">
        <form.Field name="descripcion">
          {(field) => (
            <Campo label="Descripción">
              <Textarea rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Campo>
          )}
        </form.Field>
      </div>

      <form.Field
        name="precio_base"
        validators={{ onChange: ({ value }) => (Number.isNaN(value) || value < 0 ? 'Debe ser mayor o igual a 0' : undefined) }}
      >
        {(field) => (
          <Campo label="Precio" errores={field.state.meta.errors}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            />
          </Campo>
        )}
      </form.Field>

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

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Campo label="Categoría" errores={field.state.meta.errors}>
            <Select value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))}>
              {categorias.length === 0 && <option value={0}>Primero creá una categoría</option>}
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(field) => (
          <Campo label="URL de imagen">
            <Input type="url" placeholder="https://…" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
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

      <div className="sm:col-span-2">
        <MensajeError error={error} />
      </div>

      <div className="flex justify-end gap-2 sm:col-span-2">
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
