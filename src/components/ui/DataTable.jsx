import { useMemo, useState } from "react"
import { Search, Plus, Inbox } from "lucide-react"
import { Button } from "./Button"
import { cn } from "../../lib/utils"

const filtros = [
  { key: "todos", label: "Todos" },
  { key: "activos", label: "Activos" },
  { key: "inactivos", label: "Inactivos" },
]

/**
 * Tabla reutilizable con buscador y filtro activos/inactivos.
 * columns: [{ key, header, render?, className? }]
 * searchKeys: campos sobre los que busca el buscador
 * statusKey: campo booleano para filtrar activos/inactivos (opcional)
 */
export function DataTable({
  title,
  description,
  columns,
  data,
  searchKeys = [],
  statusKey = "activo",
  onAdd,
  addLabel = "Agregar",
  showStatusFilter = true,
  emptyMessage = "No hay registros que coincidan.",
}) {
  const [query, setQuery] = useState("")
  const [filtro, setFiltro] = useState("todos")

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (showStatusFilter && filtro !== "todos") {
        const isActive = !!row[statusKey]
        if (filtro === "activos" && !isActive) return false
        if (filtro === "inactivos" && isActive) return false
      }
      if (query.trim()) {
        const q = query.toLowerCase()
        const match = searchKeys.some((k) =>
          String(row[k] ?? "").toLowerCase().includes(q),
        )
        if (!match) return false
      }
      return true
    })
  }, [data, query, filtro, searchKeys, statusKey, showStatusFilter])

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              aria-label="Buscar"
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showStatusFilter && (
              <div className="inline-flex rounded-lg border border-border bg-muted p-1">
                {filtros.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFiltro(f.key)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      filtro === f.key
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4" />
                {addLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Vista tabla en pantallas grandes */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-5 py-3 font-medium text-muted-foreground",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-5 py-3 align-middle text-foreground", c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista tarjetas en moviles */}
      <div className="divide-y divide-border md:hidden">
        {filtered.map((row) => (
          <div key={row.id} className="space-y-2 p-4">
            {columns.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {c.header}
                </span>
                <span className="text-right text-sm text-foreground">
                  {c.render ? c.render(row) : row[c.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <span>{filtered.length} de {data.length} registros</span>
      </div>
    </section>
  )
}
