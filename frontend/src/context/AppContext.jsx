import { createContext, useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { uid } from "../lib/utils"
import {
  seedClientes,
  seedUsuarios,
  seedPrendas,
  seedPedidos,
  seedHistorial,
} from "../lib/seed-data"
import { BACKEND_URL } from "../Backend"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [clientes, setClientes] = useState(seedClientes)
  const [usuarios, setUsuarios] = useState([])
  const [prendas, setPrendas] = useState(seedPrendas)
  const [pedidos, setPedidos] = useState(seedPedidos)
  const [historial, setHistorial] = useState(seedHistorial)

  async function cargarUsuarios() {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/obtenerusuarios`)
      const normalizados = (Array.isArray(data) ? data : []).map((u) => ({
        id: u.pk_usuario ?? u.id,
        nombre: u.nombres ?? u.nombre ??  "",
        apaterno: u.apaterno ?? u.apaterno ?? "",
        amaterno: u.amaterno ?? u.amaterno ?? "",
        usuario: u.nom_usu ?? u.usuario ?? "",
        rol: u.rol ?? "Empleado",
        activo: u.estatus_usu === 1 || u.estatus_usu === true || u.activo === true || u.activo === 1
      }))
      setUsuarios(normalizados)
    } catch (error) {
      console.error("No se pudieron cargar los usuarios", error)
      setUsuarios([])
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

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
  async function guardarUsuario(data) {
    if (data.id) {
      setUsuarios((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)))
      return { ok: true }
    }

    try {
      const payload = {
        nombres: data.nombre,
        apaterno: data.apaterno ?? "",
        amaterno: data.amaterno ?? "",
        usuario: data.usuario,
        password: data.password,
        rol: data.rol,
      }

      await axios.post(`${BACKEND_URL}/insertarUsuario`, payload)
      await cargarUsuarios()
      return { ok: true }
    } catch (error) {
      console.error("No se pudo registrar el usuario", error)
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo registrar el usuario.",
      }
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
