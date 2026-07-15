import { uid } from "./utils"

export const seedClientes = [
  { id: uid("cli"), nombre: "Maria Lopez", telefono: "555-101-2030", email: "maria.lopez@correo.com", direccion: "Av. Reforma 120", activo: true, creado: "2026-05-02T10:15:00" },
  { id: uid("cli"), nombre: "Jorge Ramirez", telefono: "555-204-8891", email: "jorge.r@correo.com", direccion: "Calle Pino 45", activo: true, creado: "2026-05-08T12:40:00" },
  { id: uid("cli"), nombre: "Ana Torres", telefono: "555-330-1145", email: "ana.torres@correo.com", direccion: "Blvd. Sol 8", activo: false, creado: "2026-04-19T09:05:00" },
  { id: uid("cli"), nombre: "Luis Fernandez", telefono: "555-998-7654", email: "luisf@correo.com", direccion: "Privada Luna 22", activo: true, creado: "2026-06-01T16:20:00" },
  { id: uid("cli"), nombre: "Carmen Diaz", telefono: "555-441-3322", email: "carmen.diaz@correo.com", direccion: "Calle Mar 77", activo: true, creado: "2026-06-10T11:00:00" },
]

export const seedUsuarios = [
  { id: uid("usr"), nombre: "Admin General", usuario: "admin", email: "admin@lavapos.com", rol: "Administrador", activo: true, creado: "2026-01-10T08:00:00" },
  { id: uid("usr"), nombre: "Sofia Mena", usuario: "smena", email: "sofia.mena@lavapos.com", rol: "Cajero", activo: true, creado: "2026-02-15T08:30:00" },
  { id: uid("usr"), nombre: "Pedro Soto", usuario: "psoto", email: "pedro.soto@lavapos.com", rol: "Operador", activo: false, creado: "2026-03-21T14:10:00" },
  { id: uid("usr"), nombre: "Laura Vega", usuario: "lvega", email: "laura.vega@lavapos.com", rol: "Cajero", activo: true, creado: "2026-05-05T09:45:00" },
]

function makePedido(cliente, estado, fecha, items) {
  const total = items.reduce((s, it) => s + it.precio * it.cantidad, 0)
  return { id: uid("ped"), folio: "PED-" + Math.floor(1000 + Math.random() * 9000), cliente, estado, fecha, items, total }
}

export const seedPedidos = [
  makePedido("Maria Lopez", "Pendiente", new Date().toISOString(), [
    { prenda: "Camisa", cantidad: 4, precio: 25 },
    { prenda: "Pantalon", cantidad: 2, precio: 35 },
  ]),
  makePedido("Jorge Ramirez", "Pendiente", new Date().toISOString(), [
    { prenda: "Traje completo", cantidad: 1, precio: 110 },
    { prenda: "Camisa", cantidad: 3, precio: 25 },
  ]),
  makePedido("Carmen Diaz", "En proceso", new Date().toISOString(), [
    { prenda: "Edredon matrimonial", cantidad: 1, precio: 120 },
  ]),
  makePedido("Luis Fernandez", "Entregado", "2026-06-15T10:00:00", [
    { prenda: "Vestido", cantidad: 2, precio: 60 },
  ]),
]

export const seedHistorial = [
  { id: uid("his"), modulo: "Pedidos", accion: "Creacion", descripcion: "Pedido PED-3201 registrado para Maria Lopez", usuario: "smena", fecha: new Date().toISOString() },
  { id: uid("his"), modulo: "Clientes", accion: "Edicion", descripcion: "Se actualizo el telefono de Jorge Ramirez", usuario: "admin", fecha: "2026-06-16T15:20:00" },
  { id: uid("his"), modulo: "Tipos de prenda", accion: "Baja", descripcion: "Cortinas marcado como inactivo", usuario: "admin", fecha: "2026-06-14T11:30:00" },
  { id: uid("his"), modulo: "Usuarios", accion: "Creacion", descripcion: "Usuario lvega dado de alta", usuario: "admin", fecha: "2026-05-05T09:45:00" },
  { id: uid("his"), modulo: "Pedidos", accion: "Entrega", descripcion: "Pedido PED-2890 entregado a Luis Fernandez", usuario: "lvega", fecha: "2026-06-15T17:10:00" },
]
