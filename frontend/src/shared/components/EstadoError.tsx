import { handleApiError } from '../api/handleApiError'
import { Button } from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-6 py-10 text-center ring-1 ring-red-200">
      <p className="font-medium text-red-800">No pudimos cargar los datos</p>
      <p className="text-sm text-red-700">{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secondary" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function MensajeError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
      {handleApiError(error)}
    </p>
  )
}
