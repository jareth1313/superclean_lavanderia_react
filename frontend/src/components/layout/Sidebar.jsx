import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shirt,
  ClipboardList,
  History,
  LogOut,
  Waves,
  X,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { cn } from "../../lib/utils"

const nav = [
  { to: "/", label: "Panel", icon: LayoutDashboard, end: true },
  { to: "/pedidos", label: "Pedidos diarios", icon: ClipboardList },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/prendas", label: "Tipos de prenda", icon: Shirt },
  { to: "/usuarios", label: "Usuarios", icon: UserCog },
  { to: "/historial", label: "Historial", icon: History },
]

export function Sidebar({ open, onClose }) {
  const { auth, logout } = useApp()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-secondary/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-secondary text-secondary-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold leading-none">LavaPOS</p>
              <p className="mt-1 text-xs text-secondary-foreground/60">Punto de venta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-secondary-foreground/70 hover:bg-white/10 lg:hidden"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-secondary-foreground/70 hover:bg-white/10 hover:text-secondary-foreground",
                  )
                }
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {(auth?.nombre || "U").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{auth?.nombre || "Usuario"}</p>
              <p className="truncate text-xs text-secondary-foreground/60">{auth?.rol || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-foreground/70 transition-colors hover:bg-white/10 hover:text-secondary-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  )
}
