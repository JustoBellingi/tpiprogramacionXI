import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Campo, Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const desde = (location.state as { from?: string } | null)?.from

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => login(username, password),
    onSuccess: (u) => navigate(desde ?? (u.role === 'admin' ? '/admin/resumen' : '/'), { replace: true }),
  })

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: ({ value }) => loginMutation.mutate(value),
  })

  if (usuario && loginMutation.isIdle) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-8">
        <h1 className="mb-1 text-2xl font-bold">Ingresar</h1>
        <p className="mb-6 text-sm text-stone-500">Usá tu usuario y contraseña.</p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
          >
            {(field) => (
              <Campo label="Usuario" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Campo>
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
          >
            {(field) => (
              <Campo label="Contraseña" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Campo>
            )}
          </form.Field>

          <MensajeError error={loginMutation.error} />

          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" className="w-full" disabled={!canSubmit} cargando={loginMutation.isPending}>
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
