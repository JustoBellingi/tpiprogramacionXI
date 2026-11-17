import { isAxiosError } from 'axios'

export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

interface ErrorValidacion {
  msg: string
  loc?: (string | number)[]
}

function esErrorValidacion(valor: unknown): valor is ErrorValidacion {
  return typeof valor === 'object' && valor !== null && 'msg' in valor
}

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
    const detail: unknown = (error.response.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .filter(esErrorValidacion)
        .map((d) => {
          const campo = d.loc?.[d.loc.length - 1]
          return campo ? `${campo}: ${d.msg}` : d.msg
        })
        .join(' · ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
