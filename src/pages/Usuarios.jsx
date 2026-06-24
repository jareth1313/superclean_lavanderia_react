import { useState } from "react"
import { Pencil } from "lucide-react"
import { useApp } from "../context/AppContext"
import { PageHeader } from "../components/layout/AppLayout"
import { DataTable } from "../components/ui/DataTable"
import { Modal } from "../components/ui/Modal"
import { Button } from "../components/ui/Button"
import { Field, Input, Select } from "../components/ui/Field"
import { EstadoBadge, Badge } from "../components/ui/Badge"
import { formatDate } from "../lib/utils"

const empty = { nombre: "", usuario: "", email: "", rol: "Cajero", activo: true }
const roles = ["Administrador", "Cajero", "Operador"]

export default function Usuarios() {
  const { usuarios, guardarUsuario } = useApp()
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
    guardarUsuario(form)
    setOpen(false)
  }

  const columns = [
    { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
    { key: "usuario", header: "Usuario", render: (r) => <span className="text-muted-foreground">@{r.usuario}</span> },
    { key: "email", header: "Correo", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "rol", header: "Rol", render: (r) => <Badge tone="blue">{r.rol}</Badge> },
    { key: "creado", header: "Alta", render: (r) => formatDate(r.creado) },
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
      <PageHeader title="Usuarios" description="Gestiona el personal con acceso al sistema." />

      <DataTable
        title="Lista de usuarios"
        columns={columns}
        data={usuarios}
        searchKeys={["nombre", "usuario", "email", "rol"]}
        onAdd={openNuevo}
        addLabel="Nuevo usuario"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Editar usuario" : "Nuevo usuario"}
        description="Completa los datos del usuario."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="form-usuario">Guardar</Button>
          </div>
        }
      >
        <form id="form-usuario" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo" htmlFor="u-nombre">
            <Input id="u-nombre" value={form.nombre} required
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Usuario" htmlFor="u-user">
              <Input id="u-user" value={form.usuario} required
                onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
            </Field>
            <Field label="Rol" htmlFor="u-rol">
              <Select id="u-rol" value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Correo" htmlFor="u-email">
            <Input id="u-email" type="email" value={form.email} required
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Estado" htmlFor="u-estado">
            <Select id="u-estado" value={String(form.activo)}
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
