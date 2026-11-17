import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  icono: string
  acento?: string
}

export function ResumenCard({ titulo, valor, icono, acento = 'bg-brand-100 text-brand-700' }: ResumenCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex size-12 items-center justify-center rounded-xl text-2xl ${acento}`} aria-hidden>
        {icono}
      </span>
      <div>
        <p className="text-sm text-stone-500">{titulo}</p>
        <p className="text-2xl font-bold tabular-nums">{valor}</p>
      </div>
    </Card>
  )
}
