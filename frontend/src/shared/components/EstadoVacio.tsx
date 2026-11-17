import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 px-6 py-14 text-center">
      <span className="text-4xl" aria-hidden>
        🍽️
      </span>
      <p className="font-medium text-stone-700">{titulo}</p>
      {descripcion && <p className="max-w-sm text-sm text-stone-500">{descripcion}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  )
}
