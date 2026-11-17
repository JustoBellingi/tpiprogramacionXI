import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onClose: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

export function Modal({ abierto, titulo, onClose, children, ancho = 'md' }: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onClose])

  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
