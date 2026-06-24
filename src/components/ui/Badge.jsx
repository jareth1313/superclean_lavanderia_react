import { cn } from "../../lib/utils"

const tones = {
  activo: "bg-[#dcfce7] text-[#047857]",
  inactivo: "bg-[#fee2e2] text-[#b91c1c]",
  blue: "bg-accent text-accent-foreground",
  neutral: "bg-muted text-muted-foreground",
  pendiente: "bg-[#fef3c7] text-[#b45309]",
  proceso: "bg-accent text-accent-foreground",
  entregado: "bg-[#dcfce7] text-[#047857]",
}

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone] || tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EstadoBadge({ activo }) {
  return <Badge tone={activo ? "activo" : "inactivo"}>{activo ? "Activo" : "Inactivo"}</Badge>
}

export function PedidoEstadoBadge({ estado }) {
  const map = { Pendiente: "pendiente", "En proceso": "proceso", Entregado: "entregado" }
  return <Badge tone={map[estado] || "neutral"}>{estado}</Badge>
}
