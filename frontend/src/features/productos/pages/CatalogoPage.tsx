import { useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonGrilla } from '../../../shared/components/Skeleton'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { Button } from '../../../shared/ui/Button'
import { Input, Select } from '../../../shared/ui/Input'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMIT = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const search = useDebounce(busqueda.trim())

  const { data: categorias } = useCategorias()
  const { data, isPending, isError, error, refetch, isFetching } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = data ? Math.ceil(data.total / LIMIT) : 0
  const hayFiltros = Boolean(search || categoriaId)

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold">¿Qué vas a pedir hoy?</h1>
        <p className="mt-1 text-brand-100">Elegí tus platos, armá el carrito y te lo llevamos.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0) 
          }}
          className="sm:max-w-sm"
        />
        <Select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
          className="sm:max-w-xs"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
        {isFetching && !isPending && <span className="self-center text-xs text-stone-500">Actualizando…</span>}
      </div>

      {isPending ? (
        <SkeletonGrilla />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
          accion={hayFiltros ? <Button variante="secondary" onClick={limpiarFiltros}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-stone-500">{data.total} productos</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}
