import { useMemo, useState } from "react"
import { Plus, Trash2, ClipboardList, Clock, Loader2, CheckCircle2 } from "lucide-react"
import { useApp } from "../context/AppContext"
import { PageHeader } from "../components/layout/AppLayout"
import { Modal } from "../components/ui/Modal"
import { Button } from "../components/ui/Button"
import { Field, Input, Select } from "../components/ui/Field"
import { PedidoEstadoBadge } from "../components/ui/Badge"
import { formatCurrency, formatDateTime } from "../lib/utils"

const estados = ["Pendiente", "En proceso", "Entregado"]

function lineaVacia() {
  return { prenda: "", cantidad: 1, precio: 0 }
}

export default function Pedidos() {
  const { pedidos, prendas, clientes, guardarPedido, cambiarEstadoPedido } = useApp()
  const [open, setOpen] = useState(false)
  const [cliente, setCliente] = useState("")
  const [estado, setEstado] = useState("Pendiente")
  const [items, setItems] = useState([lineaVacia()])
  const [errorForm, setErrorForm] = useState("")

  const prendasActivas = prendas.filter((p) => p.activo)
  const clientesActivos = clientes.filter((c) => c.activo)

  const hoy = new Date().toDateString()
  const pedidosHoy = pedidos.filter((p) => new Date(p.fecha).toDateString() === hoy)
  const pendientes = pedidosHoy.filter((p) => p.estado !== "Entregado")
  const ordenados = useMemo(
    () => [...pedidosHoy].sort((a, b) => (a.estado === "Entregado" ? 1 : 0) - (b.estado === "Entregado" ? 1 : 0)),
    [pedidosHoy],
  )

  function openNuevo() {
    setCliente("")
    setEstado("Pendiente")
    setItems([lineaVacia()])
    setErrorForm("")
    setOpen(true)
  }

  function setLinea(index, patch) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function seleccionarPrenda(index, nombre) {
    const p = prendasActivas.find((x) => x.nombre === nombre)
    setLinea(index, { prenda: nombre, precio: p ? p.precio : 0 })
  }

  function agregarLinea() {
    setItems((prev) => [...prev, lineaVacia()])
  }
  function quitarLinea(index) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const total = items.reduce((s, it) => s + Number(it.precio) * Number(it.cantidad), 0)

  function handleSubmit(e) {
    e.preventDefault()
    if (!cliente) return setErrorForm("Selecciona un cliente.")
    const validos = items.filter((it) => it.prenda && Number(it.cantidad) > 0)
    if (validos.length === 0) return setErrorForm("Agrega al menos una prenda al pedido.")
    guardarPedido({
      cliente,
      estado,
      items: validos.map((it) => ({ prenda: it.prenda, cantidad: Number(it.cantidad), precio: Number(it.precio) })),
    })
    setOpen(false)
  }

  const resumen = [
    { label: "Pedidos de hoy", value: pedidosHoy.length, icon: ClipboardList, tone: "text-primary" },
    { label: "Pendientes", value: pedidosHoy.filter((p) => p.estado === "Pendiente").length, icon: Clock, tone: "text-[#b45309]" },
    { label: "En proceso", value: pedidosHoy.filter((p) => p.estado === "En proceso").length, icon: Loader2, tone: "text-primary" },
    { label: "Entregados", value: pedidosHoy.filter((p) => p.estado === "Entregado").length, icon: CheckCircle2, tone: "text-success" },
  ]

  return (
    <div>
      <PageHeader
        title="Pedidos diarios"
        description="Pedidos del dia pendientes por procesar y entregar."
        action={
          <Button onClick={openNuevo}>
            <Plus className="h-4 w-4" /> Registrar pedido
          </Button>
        }
      />

      {/* Resumen */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {resumen.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <Icon className={`h-4 w-4 ${r.tone}`} />
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{r.value}</p>
            </div>
          )
        })}
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        {pendientes.length} pedido(s) pendiente(s) por hacer
      </h2>

      {ordenados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay pedidos registrados hoy.</p>
          <Button variant="outline" size="sm" onClick={openNuevo}>Registrar el primero</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ordenados.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.folio}</p>
                  <p className="text-sm text-muted-foreground">{p.cliente}</p>
                </div>
                <PedidoEstadoBadge estado={p.estado} />
              </div>

              <ul className="mt-4 space-y-2 border-t border-border pt-3">
                {p.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {it.cantidad} x {it.prenda}
                    </span>
                    <span className="text-muted-foreground">{formatCurrency(it.precio * it.cantidad)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">{formatCurrency(p.total)}</span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(p.fecha)}</p>

              <div className="mt-4 flex items-center gap-2">
                <Select
                  aria-label="Cambiar estado"
                  value={p.estado}
                  onChange={(e) => cambiarEstadoPedido(p.id, e.target.value)}
                  className="h-9"
                >
                  {estados.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal nuevo pedido con multiples prendas */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar nuevo pedido"
        description="Agrega uno o mas tipos de prenda al pedido."
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" form="form-pedido">Guardar pedido</Button>
            </div>
          </div>
        }
      >
        <form id="form-pedido" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente" htmlFor="ped-cliente">
              <Select id="ped-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)}>
                <option value="">Selecciona un cliente</option>
                {clientesActivos.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Estado inicial" htmlFor="ped-estado">
              <Select id="ped-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {estados.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Prendas del pedido</span>
              <Button variant="ghost" size="sm" onClick={agregarLinea}>
                <Plus className="h-4 w-4" /> Agregar prenda
              </Button>
            </div>

            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_88px_auto]">
                  <Select
                    aria-label="Prenda"
                    value={it.prenda}
                    onChange={(e) => seleccionarPrenda(i, e.target.value)}
                  >
                    <option value="">Selecciona prenda</option>
                    {prendasActivas.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre} - {formatCurrency(p.precio)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    aria-label="Cantidad"
                    value={it.cantidad}
                    onChange={(e) => setLinea(i, { cantidad: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => quitarLinea(i)}
                    aria-label="Quitar prenda"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-right text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(Number(it.precio) * Number(it.cantidad))}
                </p>
              </div>
            ))}
          </div>

          {errorForm && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorForm}</p>
          )}
        </form>
      </Modal>
    </div>
  )
}
