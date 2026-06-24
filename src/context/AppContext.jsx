import { createContext, useContext, useMemo, useState } from "react"
import { uid } from "../lib/utils"
import {
  seedClientes,
  seedUsuarios,
  seedPrendas,
  seedPedidos,
  seedHistorial,
} from "../lib/seed-data"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [clientes, setClientes] = useState(seedClientes)
  const [usuarios, setUsuarios] = useState(seedUsuarios)
  const [prendas, setPrendas] = useState(seedPrendas)
  const [pedidos, setPedidos] = useState(seedPedidos)
  const [historial, setHistorial] = useState(seedHistorial)

  function registrarHistorial(modulo, accion, descripcion) {
    setHistorial((prev) => [
      {
        id: uid("his"),
        modulo,
        accion,
        descripcion,
        usuario: auth?.usuario || "sistema",
        fecha: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  // ---- Auth simulado ----
  function login(usuario, password) {
    const found = seedUsuarios.find(
      (u) => u.usuario === usuario && u.activo,
    )
    // Credenciales de demo: cualquier usuario activo + password "demo123"
    if (found && password === "demo123") {
      setAuth(found)
      return { ok: true }
    }
    return { ok: false, error: "Usuario o contrasena incorrectos." }
  }

  function logout() {
    setAuth(null)
  }

  // ---- Clientes ----
  function guardarCliente(data) {
    if (data.id) {
      setClientes((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)))
      registrarHistorial("Clientes", "Edicion", `Se actualizo el cliente ${data.nombre}`)
    } else {
      const nuevo = { ...data, id: uid("cli"), creado: new Date().toISOString() }
      setClientes((prev) => [nuevo, ...prev])
      registrarHistorial("Clientes", "Creacion", `Cliente ${data.nombre} registrado`)
    }
  }

  // ---- Usuarios ----
  function guardarUsuario(data) {
    if (data.id) {
      setUsuarios((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)))
      registrarHistorial("Usuarios", "Edicion", `Se actualizo el usuario ${data.nombre}`)
    } else {
      const nuevo = { ...data, id: uid("usr"), creado: new Date().toISOString() }
      setUsuarios((prev) => [nuevo, ...prev])
      registrarHistorial("Usuarios", "Creacion", `Usuario ${data.usuario} dado de alta`)
    }
  }

  // ---- Prendas ----
  function guardarPrenda(data) {
    if (data.id) {
      setPrendas((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)))
      registrarHistorial("Tipos de prenda", "Edicion", `Se actualizo ${data.nombre}`)
    } else {
      const nuevo = { ...data, id: uid("prd"), creado: new Date().toISOString() }
      setPrendas((prev) => [nuevo, ...prev])
      registrarHistorial("Tipos de prenda", "Creacion", `Tipo de prenda ${data.nombre} registrado`)
    }
  }

  // ---- Pedidos ----
  function guardarPedido(data) {
    const total = data.items.reduce((s, it) => s + Number(it.precio) * Number(it.cantidad), 0)
    const nuevo = {
      ...data,
      id: uid("ped"),
      folio: "PED-" + Math.floor(1000 + Math.random() * 9000),
      fecha: new Date().toISOString(),
      total,
    }
    setPedidos((prev) => [nuevo, ...prev])
    registrarHistorial("Pedidos", "Creacion", `Pedido ${nuevo.folio} registrado para ${nuevo.cliente}`)
  }

  function cambiarEstadoPedido(id, estado) {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)))
    const ped = pedidos.find((p) => p.id === id)
    if (ped) registrarHistorial("Pedidos", "Cambio de estado", `${ped.folio} actualizado a ${estado}`)
  }

  const value = useMemo(
    () => ({
      auth,
      login,
      logout,
      clientes,
      usuarios,
      prendas,
      pedidos,
      historial,
      guardarCliente,
      guardarUsuario,
      guardarPrenda,
      guardarPedido,
      cambiarEstadoPedido,
    }),
    [auth, clientes, usuarios, prendas, pedidos, historial],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider")
  return ctx
}
