import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: 'sm' | 'md'
  cargando?: boolean
}

const estilos: Record<Variante, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secondary: 'bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  ghost: 'text-stone-600 hover:bg-stone-100',
}

export function Button({
  variante = 'primary',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const size = tamano === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      {...props}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition
        focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${size} ${estilos[variante]} ${className}`}
    >
      {cargando && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
