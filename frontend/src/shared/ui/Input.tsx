import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:outline-none'

interface CampoProps {
  label: string
  errores?: unknown[]
  children: ReactNode
}

export function Campo({ label, errores = [], children }: CampoProps) {
  const mensajes = errores.filter((e): e is string => typeof e === 'string' && e.length > 0)
  return (
    <div className="space-y-1">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        {children}
      </label>
      {mensajes.length > 0 && <p className="text-xs text-red-600">{mensajes.join(', ')}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${className}`} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${base} ${className}`}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} ${className}`} />
}
