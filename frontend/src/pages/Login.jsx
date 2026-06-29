import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Waves, Lock, User, AlertCircle } from "lucide-react"
import { useApp } from "../context/AppContext"
import { Button } from "../components/ui/Button"
import { Field, Input } from "../components/ui/Field"

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState("admin")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    setError("")
    const res = login(usuario.trim(), password)
    if (res.ok) {
      navigate("/")
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:grid-cols-2">
        {/* Panel de marca */}
        <div className="hidden flex-col justify-between bg-primary p-8 text-primary-foreground md:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Waves className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">LavaPOS</span>
          </div>
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-balance">
              Gestiona tu lavanderia con orden y rapidez
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80 text-pretty">
              Clientes, pedidos diarios, tipos de prenda y usuarios, todo en un mismo lugar.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/70">
            Acceso de demo: usuario "admin" y contrasena "demo123".
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <div className="mb-6 flex items-center gap-2.5 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold text-foreground">LavaPOS</span>
          </div>

          <h1 className="text-2xl font-semibold text-foreground">Iniciar sesion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa tus credenciales para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Usuario" htmlFor="usuario">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="admin"
                  className="pl-9"
                  autoComplete="username"
                  required
                />
              </div>
            </Field>

            <Field label="Contrasena" htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
