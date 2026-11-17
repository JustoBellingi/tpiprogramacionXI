import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

type Edicion = { modo: 'crear' } | { modo: 'editar'; categoria: Categoria }

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias()
  const guardar = useGuardarCategoria()
  const eliminar = useEliminarCategoria()
  const [edicion, setEdicion] = useState<Edicion | null>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)

  const abrir = (e: Edicion) => {
    guardar.reset() 
    setEdicion(e)
  }

  const onGuardar = (datos: CategoriaInput) => {
    const id = edicion?.modo === 'editar' ? edicion.categoria.id : undefined
    guardar.mutate({ id, data: datos }, { onSuccess: () => setEdicion(null) })
  }

  const columnas: ColumnDef<Categoria>[] = [
    { id: 'nombre', header: 'Nombre', accessorFn: (c) => c.nombre },
    { id: 'descripcion', header: 'Descripción', accessorFn: (c) => c.descripcion ?? '', cell: ({ row }) => row.original.descripcion ?? '—' },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <Button variante="secondary" tamano="sm" onClick={() => abrir({ modo: 'editar', categoria: row.original })}>
            Editar
          </Button>
          <Button
            variante="danger"
            tamano="sm"
            onClick={() => {
              eliminar.reset()
              setAEliminar(row.original)
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => abrir({ modo: 'crear' })}>+ Nueva categoría</Button>
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <DataTable datos={data} columnas={columnas} buscador />
      )}

      <Modal
        abierto={edicion !== null}
        titulo={edicion?.modo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setEdicion(null)}
      >
        {edicion && (
          <CategoriaForm
            key={edicion.modo === 'editar' ? edicion.categoria.id : 'nueva'}
            inicial={edicion.modo === 'editar' ? edicion.categoria : undefined}
            onGuardar={onGuardar}
            onCancelar={() => setEdicion(null)}
            guardando={guardar.isPending}
            error={guardar.error}
          />
        )}
      </Modal>

      <Modal abierto={aEliminar !== null} titulo="Eliminar categoría" onClose={() => setAEliminar(null)}>
        <p className="text-sm text-stone-600">
          ¿Dar de baja la categoría <strong>{aEliminar?.nombre}</strong>? Sus productos siguen visibles hasta que los des de baja
          también, y el nombre queda reservado.
        </p>
        <div className="mt-4">
          <MensajeError error={eliminar.error} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secondary" onClick={() => setAEliminar(null)}>
            Volver
          </Button>
          <Button
            variante="danger"
            cargando={eliminar.isPending}
            onClick={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
