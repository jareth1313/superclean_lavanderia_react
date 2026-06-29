import { Link, useRouteError } from "react-router-dom"
import { Waves, Home, AlertTriangle } from "lucide-react"

export default function ErrorPage() {
  const error = useRouteError?.()
  const status = error?.status || 404
  const isNotFound = status === 404

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 text-center">
      <div className="flex items-center gap-2.5 text-primary-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Waves className="h-6 w-6" />
        </div>
        <span className="text-xl font-semibold">LavaPOS</span>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <p className="mt-6 text-6xl font-bold text-primary-foreground">{isNotFound ? "404" : status}</p>
        <h1 className="mt-3 text-2xl font-semibold text-primary-foreground text-balance">
          {isNotFound ? "Pagina no encontrada" : "Algo salio mal"}
        </h1>
        <p className="mt-2 max-w-md text-sm text-primary-foreground/70 text-pretty">
          {isNotFound
            ? "La pagina que buscas no existe o fue movida. Verifica la direccion e intenta de nuevo."
            : error?.statusText || error?.message || "Ocurrio un error inesperado en el sistema."}
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  )
}
