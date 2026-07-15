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

const empty = { nombre: "", descripcion: "", precio: "", activo: true }

export default function Prendas() {
  const { prendas, guardarPrenda } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  function openNuevo() {
    setForm(empty)
    setOpen(true)
  }
  function openEditar(row) {
    setForm({ ...row, precio: String(row.precio) })
    setOpen(true)
  }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const result = await guardarPrenda({ ...form, precio: Number(form.precio) || 0 })
    setLoading(false)
    if (result.ok) {
      setOpen(false)
    } else {
      alert(result.error)
    }
  }

  const columns = [
    { key: "nombre", header: "Tipo de prenda", render: (r) => <span className="font-medium">{r.nombre}</span> },
    { key: "descripcion", header: "Descripción", render: (r) => <span className="text-sm text-muted-foreground">{r.descripcion || "-"}</span> },
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
      <PageHeader title="Tipos de prenda" description="Define las prendas disponibles con su descripción y precio." />

      <DataTable
        title="Catalogo de prendas"
        columns={columns}
        data={prendas}
        searchKeys={["nombre", "descripcion"]}
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
            <Button type="submit" form="form-prenda" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          </div>
        }
      >
        <form id="form-prenda" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre de la prenda" htmlFor="p-nombre">
            <Input id="p-nombre" value={form.nombre} required
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <Field label="Descripción" htmlFor="p-desc">
            <Input id="p-desc" value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Ej: Blusa de algodón, Pantalón de mezclilla" />
          </Field>
          <Field label="Precio (MXN)" htmlFor="p-precio">
            <Input id="p-precio" type="number" min="0" step="1" value={form.precio} required
              onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          </Field>
          {form.id && (
            <Field label="Estado" htmlFor="p-estado">
              <Select id="p-estado" value={String(form.activo)}
                onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
            </Field>
          )}
        </form>
      </Modal>
    </div>
  )
}
