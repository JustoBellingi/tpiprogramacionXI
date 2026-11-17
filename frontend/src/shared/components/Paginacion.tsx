import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 py-4 text-sm">
      <Button variante="secondary" tamano="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span className="text-stone-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secondary"
        tamano="sm"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </Button>
    </div>
  )
}
