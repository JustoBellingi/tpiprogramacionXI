import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md p-10 text-center">
      <h1 className="mt-4 text-xl font-bold">No tenés permiso para ver esta página</h1>
      <p className="mt-2 text-sm text-stone-500">Esta sección es solo para administradores.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
        Volver al inicio
      </Link>
    </Card>
  )
}
