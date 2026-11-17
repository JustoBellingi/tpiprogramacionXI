import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { MensajeError } from '../../../shared/components/EstadoError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Campo, Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import { registerRequest } from '../api/auth'
import type { UserCreate } from '../types/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const registerMutation = useMutation({
    mutationFn: async (data: UserCreate) => {
      await registerRequest(data)
      await login(data.username, data.password) 
    },
    onSuccess: () => navigate('/', { replace: true }),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: ({ value }) => {
      const { confirmar: _confirmar, ...data } = value
      registerMutation.mutate(data)
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-stone-500">Registrate para hacer tus pedidos.</p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3 ? 'Mínimo 3 caracteres' : value.length > 50 ? 'Máximo 50 caracteres' : undefined,
            }}
          >
            {(field) => (
              <Campo label="Usuario" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined) }}
          >
            {(field) => (
              <Campo label="Nombre completo" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (EMAIL_RE.test(value) ? undefined : 'Email inválido') }}
          >
            {(field) => (
              <Campo label="Email" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input type="email" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length < 8 ? 'Mínimo 8 caracteres' : undefined) }}
          >
            {(field) => (
              <Campo label="Contraseña" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input type="password" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password') ? 'Las contraseñas no coinciden' : undefined,
            }}
          >
            {(field) => (
              <Campo label="Repetir contraseña" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input type="password" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>

          <MensajeError error={registerMutation.error} />

          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" className="w-full" disabled={!canSubmit} cargando={registerMutation.isPending}>
                Crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
