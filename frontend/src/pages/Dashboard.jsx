import { Link } from "react-router-dom"
import { Users, Shirt, ClipboardList, Clock, ArrowRight } from "lucide-react"
import { useApp } from "../context/AppContext"
import { PageHeader } from "../components/layout/AppLayout"
import { PedidoEstadoBadge } from "../components/ui/Badge"
import { formatCurrency, formatDateTime } from "../lib/utils"

export default function Dashboard() {
  const { auth, clientes, prendas, pedidos, historial } = useApp()

  const hoy = new Date().toDateString()
  const pedidosHoy = pedidos.filter((p) => new Date(p.fecha).toDateString() === hoy)
  const pendientes = pedidosHoy.filter((p) => p.estado !== "Entregado")
  const ventaHoy = pedidosHoy.reduce((s, p) => s + p.total, 0)

  const stats = [
    { label: "Clientes activos", value: clientes.filter((c) => c.activo).length, icon: Users, to: "/clientes" },
    { label: "Tipos de prenda", value: prendas.filter((p) => p.activo).length, icon: Shirt, to: "/prendas" },
    { label: "Pedidos de hoy", value: pedidosHoy.length, icon: ClipboardList, to: "/pedidos" },
    { label: "Pendientes", value: pendientes.length, icon: Clock, to: "/pedidos" },
  ]

  return (
    <div>
      <PageHeader
        title={`Hola, ${auth?.nombre?.split(" ")[0] || "bienvenido"}`}
        description="Resumen general de la operacion de la lavanderia."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              to={s.to}
              className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{s.value}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-primary p-5 text-primary-foreground">
        <p className="text-sm text-primary-foreground/80">Venta estimada de hoy</p>
        <p className="mt-1 text-3xl font-semibold">{formatCurrency(ventaHoy)}</p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Pedidos pendientes */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pedidos pendientes</h2>
            <Link to="/pedidos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {pendientes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No hay pedidos pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {pendientes.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.folio} - {p.cliente}</p>
                    <p className="text-xs text-muted-foreground">{p.items.length} prenda(s) - {formatCurrency(p.total)}</p>
                  </div>
                  <PedidoEstadoBadge estado={p.estado} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Actividad reciente */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Actividad reciente</h2>
            <Link to="/historial" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Ver historial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="space-y-3">
            {historial.slice(0, 5).map((h) => (
              <li key={h.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-foreground">{h.descripcion}</p>
                <p className="text-xs text-muted-foreground">{h.modulo} - {formatDateTime(h.fecha)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
