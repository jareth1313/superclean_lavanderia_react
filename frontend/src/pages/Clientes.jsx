import { useState } from "react"
import { Pencil } from "lucide-react"
import { useApp } from "../context/AppContext"
import { PageHeader } from "../components/layout/AppLayout"
import { DataTable } from "../components/ui/DataTable"
import { Modal } from "../components/ui/Modal"
import { Button } from "../components/ui/Button"
import { Field, Input, Select } from "../components/ui/Field"
import { EstadoBadge } from "../components/ui/Badge"
import { formatDate } from "../lib/utils"

const empty = { nombre: "", telefono: "", email: "", direccion: "", activo: true }

export default function Clientes() {
  const { clientes, guardarCliente } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  function openNuevo() {
    setForm(empty)
    setOpen(true)
  }
  function openEditar(row) {
    setForm({ ...row })
    setOpen(true)
  }
  function handleSubmit(e) {
    e.preventDefault()
    guardarCliente({ ...form, activo: form.activo === true || form.activo === "true" })
    setOpen(false)
  }

  const columns = [
    { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
    { key: "telefono", header: "Telefono" },
    { key: "email", header: "Correo", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "creado", header: "Registro", render: (r) => formatDate(r.creado) },
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
      <PageHeader title="Clientes" description="Administra la base de clientes de la lavanderia." />

      <DataTable
        title="Lista de clientes"
        columns={columns}
        data={clientes}
        searchKeys={["nombre", "telefono", "email", "direccion"]}
        onAdd={openNuevo}
        addLabel="Nuevo cliente"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Editar cliente" : "Nuevo cliente"}
        description="Completa los datos del cliente."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="form-cliente">Guardar</Button>
          </div>
        }
      >
        <form id="form-cliente" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo" htmlFor="c-nombre">
            <Input id="c-nombre" value={form.nombre} required
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefono" htmlFor="c-tel">
              <Input id="c-tel" value={form.telefono} required
                onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </Field>
            <Field label="Correo" htmlFor="c-email">
              <Input id="c-email" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <Field label="Direccion" htmlFor="c-dir">
            <Input id="c-dir" value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </Field>
          <Field label="Estado" htmlFor="c-estado">
            <Select id="c-estado" value={String(form.activo)}
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
