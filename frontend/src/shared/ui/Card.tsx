import type { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 ${className}`}>
      {children}
    </div>
  )
}
