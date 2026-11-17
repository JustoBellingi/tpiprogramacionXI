import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, MensajeError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import type { Usuario } from '../../auth/types/auth'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'

export function AdminUsuariosPage() {
  const yo = useAuthStore((s) => s.usuario)
  const { data, isPending, isError, error, refetch } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()

  const columnas: ColumnDef<Usuario>[] = [
    { id: 'username', header: 'Usuario', accessorFn: (u) => u.username, cell: ({ row }) => `@${row.original.username}` },
    { id: 'nombre', header: 'Nombre', accessorFn: (u) => u.full_name },
    { id: 'email', header: 'Email', accessorFn: (u) => u.email },
    {
      id: 'rol',
      header: 'Rol',
      accessorFn: (u) => u.role,
      cell: ({ row }) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.original.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-600'}`}>
          {row.original.role}
        </span>
      ),
    },
    {
      id: 'estado',
      header: 'Estado',
      accessorFn: (u) => (u.disabled ? 'Inactivo' : 'Activo'),
      cell: ({ row }) =>
        row.original.disabled ? <span className="text-red-600">Inactivo</span> : <span className="text-emerald-700">Activo</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original
        const procesando = cambiarEstado.isPending && cambiarEstado.variables?.id === u.id
        if (u.disabled) {
          return (
            <Button tamano="sm" cargando={procesando} onClick={() => cambiarEstado.mutate({ id: u.id, activar: true })}>
              Activar
            </Button>
          )
        }
        if (u.id === yo?.id) return <span className="text-xs text-stone-400">(tu cuenta)</span>
        return (
          <Button variante="danger" tamano="sm" cargando={procesando} onClick={() => cambiarEstado.mutate({ id: u.id, activar: false })}>
            Desactivar
          </Button>
        )
      },
    },
  ]

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <MensajeError error={cambiarEstado.error} />
      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <DataTable datos={data} columnas={columnas} buscador />
      )}
    </section>
  )
}
