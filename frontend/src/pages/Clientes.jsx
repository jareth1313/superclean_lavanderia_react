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

const empty = { nombre: "", apaterno: "", amaterno: "", activo: true }

export default function Clientes() {
  const { clientes, guardarCliente } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successCreateOpen, setSuccessCreateOpen] = useState(false)
  const [successEditOpen, setSuccessEditOpen] = useState(false)

  function openNuevo() {
    setForm(empty)
    setErrorMsg("")
    setOpen(true)
  }
  function openEditar(row) {
    setForm({
      ...row,
      nombre: row.nombres ?? row.nombre ?? "",
      apaterno: row.apaterno ?? "",
      amaterno: row.amaterno ?? "",
      activo: row.activo,
    })
    setErrorMsg("")
    setOpen(true)
  }

  function submitForm() {
    const formEl = document.getElementById("form-cliente")
    if (!formEl || !formEl.reportValidity()) return
    formEl.requestSubmit()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const creando = !form.id
    setSaving(true)
    setErrorMsg("")
    const result = await guardarCliente({ ...form, activo: form.activo === true || form.activo === "true" })
    if (result?.ok) {
      setOpen(false)
      if (creando) {
        setSuccessCreateOpen(true)
      } else {
        setSuccessEditOpen(true)
      }
    } else {
      setErrorMsg(result?.error || "No se pudo guardar el cliente.")
    }
    setSaving(false)
  }

  const columns = [
    { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre}</span> },
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
        searchKeys={["nombre", "apaterno", "amaterno"]}
        initialStatusFilter="activos"
        onAdd={openNuevo}
        addLabel="Nuevo cliente"
      />

      <Modal
        open={open}
        onClose={() => {
          if (saving) return
          setOpen(false)
        }}
        title={form.id ? "Editar cliente" : "Nuevo cliente"}
        description="Completa los datos del cliente."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="button" onClick={submitForm} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        }
      >
        <form id="form-cliente" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombres" htmlFor="c-nombre">
            <Input id="c-nombre" value={form.nombre} required
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apellido Paterno" htmlFor="c-apaterno">
              <Input id="c-apaterno" value={form.apaterno ?? ""}
                onChange={(e) => setForm({ ...form, apaterno: e.target.value })} />
            </Field>
            <Field label="Apellido Materno" htmlFor="c-amaterno">
              <Input id="c-amaterno" value={form.amaterno ?? ""}
                onChange={(e) => setForm({ ...form, amaterno: e.target.value })} />
            </Field>
          </div>
          <Field label="Estado" htmlFor="c-estado">
            <Select id="c-estado" value={String(form.activo)}
              onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </Field>
          {errorMsg && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</p>
          )}
        </form>
      </Modal>

      <Modal
        open={successCreateOpen}
        onClose={() => setSuccessCreateOpen(false)}
        title="Cliente creado"
        description="El cliente se registro correctamente."
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setSuccessCreateOpen(false)}>Aceptar</Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">Ya puedes ver el cliente en la lista y editarlo cuando lo necesites.</p>
      </Modal>

      <Modal
        open={successEditOpen}
        onClose={() => setSuccessEditOpen(false)}
        title="Cliente actualizado"
        description="Los datos del cliente se actualizaron correctamente."
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setSuccessEditOpen(false)}>Aceptar</Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">Los cambios ya se reflejan en la lista de clientes.</p>
      </Modal>
    </div>
  )
}
