import { useApp } from "../context/AppContext"
import { PageHeader } from "../components/layout/AppLayout"
import { DataTable } from "../components/ui/DataTable"
import { Badge } from "../components/ui/Badge"
import { formatDateTime } from "../lib/utils"

const accionTone = {
  Creacion: "activo",
  Edicion: "blue",
  Baja: "inactivo",
  Entrega: "activo",
  "Cambio de estado": "blue",
}

export default function Historial() {
  const { historial } = useApp()

  const columns = [
    { key: "fecha", header: "Fecha", render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.fecha)}</span> },
    { key: "modulo", header: "Modulo", render: (r) => <Badge tone="neutral">{r.modulo}</Badge> },
    { key: "accion", header: "Accion", render: (r) => <Badge tone={accionTone[r.accion] || "neutral"}>{r.accion}</Badge> },
    { key: "descripcion", header: "Descripcion", render: (r) => <span className="text-foreground">{r.descripcion}</span> },
    { key: "usuario", header: "Usuario", render: (r) => <span className="text-muted-foreground">@{r.usuario}</span> },
  ]

  return (
    <div>
      <PageHeader title="Historial de registro" description="Registro de movimientos realizados en el sistema." />

      <DataTable
        title="Movimientos recientes"
        columns={columns}
        data={historial}
        searchKeys={["modulo", "accion", "descripcion", "usuario"]}
        showStatusFilter={false}
        emptyMessage="No hay movimientos registrados."
      />
    </div>
  )
}
