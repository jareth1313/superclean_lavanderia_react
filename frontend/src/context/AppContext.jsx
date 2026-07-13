import { createContext, useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { uid } from "../lib/utils"

axios.defaults.withCredentials = true
import {
  seedUsuarios,
  seedPrendas,
  seedPedidos,
  seedHistorial,
} from "../lib/seed-data"
import { BACKEND_URL } from "../Backend"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [clientes, setClientes] = useState([])
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

  async function cargarClientes() {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/obtenerclientes`)
      const normalizados = (Array.isArray(data) ? data : []).map((c) => {
        const nombres = c.nombres ?? ""
        const apaterno = c.apaterno ?? ""
        const amaterno = c.amaterno ?? ""
        const nombreCompleto = [nombres, apaterno, amaterno].filter(Boolean).join(" ")

        return {
          id: c.pk_cliente ?? c.id,
          // nombre se usa para mostrar en tablas/selects.
          nombre: nombreCompleto || c.nombre || "",
          // nombres se usa para el formulario de edicion/guardado sin duplicar apellidos.
          nombres,
          apaterno,
          amaterno,
          activo: c.estatus_cliente === 1 || c.activo === 1 || c.activo === true,
          creado: c.creado ?? c.fecha_registro ?? c.created_at ?? new Date().toISOString(),
        }
      })
      setClientes(normalizados)
    } catch (error) {
      console.error("No se pudieron cargar los clientes", error)
      setClientes([])
    }
  }

  useEffect(() => {
    cargarClientes()
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
  async function login(usuario, password) {
    // Try backend login first
    try {
      const { data } = await axios.post(`${BACKEND_URL}/login`, { usuario, password }, { withCredentials: true })
      if (data?.ok) {
        // Normalize minimal auth shape
        const u = data.user
        setAuth({ id: u.id, usuario: u.usuario, rol: u.rol })
        return { ok: true }
      }
      return { ok: false, error: data?.error || 'Usuario o contrasena incorrectos.' }
    } catch (error) {
      console.error('Login error', error)
      return { ok: false, error: error.response?.data?.error || error.message || 'Error al iniciar sesion.' }
    }
  }

  function logout() {
    setAuth(null)
  }

  // ---- Clientes ----
  async function guardarCliente(data) {
    try {
      const payload = {
        nombre: data.nombre,
        apaterno: data.apaterno ?? "",
        amaterno: data.amaterno ?? "",
        activo: data.activo,
      }

      if (data.id) {
        await axios.put(`${BACKEND_URL}/actualizarCliente/${data.id}`, payload)
        registrarHistorial("Clientes", "Edicion", `Se actualizo el cliente ${data.nombre}`)
      } else {
        await axios.post(`${BACKEND_URL}/insertarCliente`, payload)
        registrarHistorial("Clientes", "Creacion", `Cliente ${data.nombre} registrado`)
      }

      await cargarClientes()
      return { ok: true }
    } catch (error) {
      console.error("No se pudo guardar el cliente", error)
      return {
        ok: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          error.message ||
          "No se pudo guardar el cliente.",
      }
    }
  }

  // ---- Usuarios ----
  async function guardarUsuario(data) {
    try {
      const payload = {
        nombres: data.nombre,
        apaterno: data.apaterno ?? "",
        amaterno: data.amaterno ?? "",
        usuario: data.usuario,
        rol: data.rol,
        activo: data.activo ?? true,
      }

      if (data.password !== undefined && data.password !== null) {
        payload.password = data.password
      }

      if (data.id) {
        await axios.put(`${BACKEND_URL}/actualizarUsuario/${data.id}`, payload)
        await cargarUsuarios()
        return { ok: true }
      }

      await axios.post(`${BACKEND_URL}/insertarUsuario`, payload)
      await cargarUsuarios()
      return { ok: true }
    } catch (error) {
      console.error("No se pudo guardar el usuario", error)
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo guardar el usuario.",
      }
    }
  }

  async function darDeBajaUsuario(id, activo = false) {
    const usuarioActual = usuarios.find((u) => u.id === id)
    if (!usuarioActual) {
      return { ok: false, error: "Usuario no encontrado." }
    }

    try {
      await axios.put(`${BACKEND_URL}/darDeBajaUsuario/${id}`, {
        activo,
      })
      await cargarUsuarios()
      return { ok: true }
    } catch (error) {
      console.error("No se pudo dar de baja al usuario", error)
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo dar de baja al usuario.",
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
      darDeBajaUsuario,
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
