import { NavLink, Outlet } from 'react-router-dom'

const secciones = [
  { to: '/admin/resumen', label: 'Resumen' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/usuarios', label: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-xl bg-white p-1 ring-1 ring-stone-200">
        {secciones.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`
            }
          >
            {s.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
