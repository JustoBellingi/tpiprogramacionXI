import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/types/paginado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useActualizarStock, useEliminarProducto, useGuardarProducto, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoInput, ProductoStockUpdate } from '../types/producto'

type Accion =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }

export function AdminProductosPage() {
  const { data, isPending, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const { data: categorias = [] } = useCategorias()
  const guardar = useGuardarProducto()
  const stock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const [accion, setAccion] = useState<Accion | null>(null)

  const abrir = (a: Accion) => {
    guardar.reset()
    stock.reset()
    eliminar.reset()
    setAccion(a)
  }
  const cerrar = () => setAccion(null)

  const onGuardar = (datos: ProductoInput) => {
    const id = accion?.tipo === 'editar' ? accion.producto.id : undefined
    guardar.mutate({ id, data: datos }, { onSuccess: cerrar })
  }

  const onGuardarStock = (datos: ProductoStockUpdate) => {
    if (accion?.tipo !== 'stock') return
    stock.mutate({ id: accion.producto.id, data: datos }, { onSuccess: cerrar })
  }

  const columnas: ColumnDef<Producto>[] = [
    {
      id: 'nombre',
      header: 'Producto',
      accessorFn: (p) => p.nombre,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imagen_url ? (
            <img src={row.original.imagen_url} alt="" className="size-10 rounded-lg object-cover" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-lg bg-stone-100">🍽️</span>
          )}
          <span className="font-medium">{row.original.nombre}</span>
        </div>
      ),
    },
    { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
    { id: 'precio', header: 'Precio', accessorFn: (p) => p.precio_base, cell: ({ row }) => formatPrecio(row.original.precio_base) },
    {
      id: 'stock',
      header: 'Stock',
      accessorFn: (p) => p.stock,
      cell: ({ row }) => (
        <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>{row.original.stock}</span>
      ),
    },
    {
      id: 'disponible',
      header: 'Disponible',
      accessorFn: (p) => (p.disponible ? 'Sí' : 'No'),
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="text-emerald-700">Sí</span>
        ) : (
          <span className="text-stone-500">No</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          <Button variante="secondary" tamano="sm" onClick={() => abrir({ tipo: 'editar', producto: row.original })}>
            Editar
          </Button>
          <Button variante="secondary" tamano="sm" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
            Stock
          </Button>
          <Button variante="danger" tamano="sm" onClick={() => abrir({ tipo: 'eliminar', producto: row.original })}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const tituloModal =
    accion?.tipo === 'crear'
      ? 'Nuevo producto'
      : accion?.tipo === 'editar'
        ? 'Editar producto'
        : accion?.tipo === 'stock'
          ? `Stock de ${accion.producto.nombre}`
          : 'Eliminar producto'

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => abrir({ tipo: 'crear' })}>+ Nuevo producto</Button>
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <DataTable datos={data.items} columnas={columnas} buscador />
      )}

      <Modal abierto={accion !== null} titulo={tituloModal} onClose={cerrar} ancho={accion?.tipo === 'stock' || accion?.tipo === 'eliminar' ? 'md' : 'lg'}>
        {(accion?.tipo === 'crear' || accion?.tipo === 'editar') && (
          <ProductoForm
            key={accion.tipo === 'editar' ? accion.producto.id : 'nuevo'}
            inicial={accion.tipo === 'editar' ? accion.producto : undefined}
            categorias={categorias}
            onGuardar={onGuardar}
            onCancelar={cerrar}
            guardando={guardar.isPending}
            error={guardar.error}
          />
        )}
        {accion?.tipo === 'stock' && (
          <StockForm
            key={accion.producto.id}
            producto={accion.producto}
            onGuardar={onGuardarStock}
            onCancelar={cerrar}
            guardando={stock.isPending}
            error={stock.error}
          />
        )}
        {accion?.tipo === 'eliminar' && (
          <>
            <p className="text-sm text-stone-600">
              ¿Dar de baja <strong>{accion.producto.nombre}</strong>? Deja de aparecer en el catálogo; los pedidos anteriores
              conservan su copia del nombre y precio.
            </p>
            <div className="mt-4">
              <MensajeError error={eliminar.error} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variante="secondary" onClick={cerrar}>
                Volver
              </Button>
              <Button variante="danger" cargando={eliminar.isPending} onClick={() => eliminar.mutate(accion.producto.id, { onSuccess: cerrar })}>
                Eliminar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </section>
  )
}
