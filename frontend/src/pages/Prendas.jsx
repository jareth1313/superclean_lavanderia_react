import { useState } from "react"
import { Pencil } from "lucide-react"
import { useApp } from "../context/AppContext"
import { PageHeader } from "../components/layout/AppLayout"
import { DataTable } from "../components/ui/DataTable"
import { Modal } from "../components/ui/Modal"
import { Button } from "../components/ui/Button"
import { Field, Input, Select } from "../components/ui/Field"
import { EstadoBadge, Badge } from "../components/ui/Badge"
import { formatCurrency } from "../lib/utils"

const empty = { nombre: "", categoria: "Ropa", servicio: "Lavado y planchado", precio: "", activo: true }
const categorias = ["Ropa", "Hogar", "Calzado", "Otro"]
const servicios = ["Lavado y planchado", "Lavado en seco", "Lavado especial", "Solo planchado", "Solo lavado"]

export default function Prendas() {
  const { prendas, guardarPrenda } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  function openNuevo() {
    setForm(empty)
    setOpen(true)
  }
  function openEditar(row) {
    setForm({ ...row, precio: String(row.precio) })
    setOpen(true)
  }
  function handleSubmit(e) {
    e.preventDefault()
    guardarPrenda({ ...form, precio: Number(form.precio) || 0 })
    setOpen(false)
  }

  const columns = [
    { key: "nombre", header: "Tipo de prenda", render: (r) => <span className="font-medium">{r.nombre}</span> },
    { key: "categoria", header: "Categoria", render: (r) => <Badge tone="neutral">{r.categoria}</Badge> },
    { key: "servicio", header: "Servicio", render: (r) => <span className="text-muted-foreground">{r.servicio}</span> },
    { key: "precio", header: "Precio", render: (r) => <span className="font-medium">{formatCurrency(r.precio)}</span> },
    { key: "activo", header: "Estado", render: (r) => <EstadoBadge activo={r.activo} /> },
    {
      key: "acciones",
      header: "",
      className: "text-right",
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => openEditar(r)}>
          <Pencil className="h-4 w-4" /> Editar
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Tipos de prenda" description="Define las prendas y servicios disponibles con su precio." />

      <DataTable
        title="Catalogo de prendas"
        columns={columns}
        data={prendas}
        searchKeys={["nombre", "categoria", "servicio"]}
        onAdd={openNuevo}
        addLabel="Nuevo tipo"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Editar tipo de prenda" : "Nuevo tipo de prenda"}
        description="Completa los datos del tipo de prenda."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="form-prenda">Guardar</Button>
          </div>
        }
      >
        <form id="form-prenda" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre de la prenda" htmlFor="p-nombre">
            <Input id="p-nombre" value={form.nombre} required
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria" htmlFor="p-cat">
              <Select id="p-cat" value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Precio (MXN)" htmlFor="p-precio">
              <Input id="p-precio" type="number" min="0" step="1" value={form.precio} required
                onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            </Field>
          </div>
          <Field label="Servicio" htmlFor="p-serv">
            <Select id="p-serv" value={form.servicio}
              onChange={(e) => setForm({ ...form, servicio: e.target.value })}>
              {servicios.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Estado" htmlFor="p-estado">
            <Select id="p-estado" value={String(form.activo)}
              onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  )
}
