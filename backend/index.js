//simplemente estamos usando express
const expess = require('express');

// cors permite que el frontend (que corre en otro puerto) pueda hacer peticiones al backend sin problemas de seguridad.
const cors = require('cors');

// dotenv nos permite cargar las variables de entorno definidas en el archivo .env
// config() carga las variables de entorno para que podamos usarlas en nuestro código.
require('dotenv').config();


const query = require('./query');

//express crea el servidor y lo guarda en la variable app.
const app = expess();

const PORT = 5002;

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizarNombres(nombres, apaterno, amaterno) {
    let base = String(nombres || '').trim().replace(/\s+/g, ' ');
    const ap = String(apaterno || '').trim().replace(/\s+/g, ' ');
    const am = String(amaterno || '').trim().replace(/\s+/g, ' ');
    const apellidos = [ap, am].filter(Boolean).join(' ');

    if (!base || !apellidos) return base;

    // Si nombres llega como "Nombres Apellido1 Apellido2", quitamos el sufijo de apellidos.
    const suffix = new RegExp(`\\s+${escapeRegex(apellidos)}$`, 'i');
    while (suffix.test(base)) {
        base = base.replace(suffix, '').trim();
    }
    return base;
}

// Usamos cors como middleware para permitir peticiones desde el frontend.
app.use(cors());

//Los datos setraen con json
//sin esto, no se podría leer los datos.
app.use(expess.json());

// app.get es la ruta de tipo get
//'/obtenerusuarios' es la ruta a la que se va a acceder desde el frontend para obtener los usuarios.
// req es la petición que hace el frontend, 
// res es la respuesta que el backend va a enviar al frontend.
// async espera respuesta de la función getUsuarios() antes de continuar con el código.
app.get('/obtenerusuarios', async (req, res) => {
    try {
        // getUsuarios() es la función que definimos en query.js para obtener los usuarios de la base de datos.
        const usuarios = await query.obtenerUsuarios();

        // res.json() envía la respuesta al frontend en formato JSON.
        res.json(usuarios);
        
    } catch (error) {
        // Si hay un error, se envía un mensaje de error al frontend.
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

app.get('/obtenerclientes', async (req, res) => {
    try {
        const clientes = await query.obtenerClientes();
        res.json(clientes);
    } catch (error) {
        console.error("Error en la ruta /obtenerclientes:", error);
        res.status(500).json({
            error: 'Error al obtener los clientes',
            detail: error.sqlMessage || error.message,
        });
    }
});

app.post('/insertarUsuario', async (req, res) => {
    try {
        const { nombres, apaterno, amaterno, usuario, password, rol } = req.body;

        if (!nombres || !usuario || !password) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        
        // 1. Guardamos el ID que retorna la función en una variable (ej. fkpersona)
        const fkpersona = await query.insertarPersona(nombres, apaterno || '', amaterno || '');
        
        // 2. Usamos esa variable recién creada para pasársela a insertUsuario
        await query.insertarUsuario(usuario, password, rol || 'Empleado', fkpersona);
        
        res.status(201).json({ message: 'Usuario insertado correctamente' });
    } catch (error) {
        // Es buena práctica imprimir el error en consola para saber qué falló en el backend
        console.error("Error en la ruta /insertarUsuario:", error); 
        res.status(500).json({ error: 'Error al insertar el usuario' });
    }
});

app.post('/insertarCliente', async (req, res) => {
    try {
        const { nombre, apaterno, amaterno } = req.body;
        const nombresNormalizados = normalizarNombres(nombre, apaterno, amaterno);

        if (!nombresNormalizados) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const fkpersona = await query.insertarPersona(nombresNormalizados, apaterno || '', amaterno || '');
        await query.insertarCliente(fkpersona);

        res.status(201).json({ message: 'Cliente insertado correctamente' });
    } catch (error) {
        console.error("Error en la ruta /insertarCliente:", error);
        res.status(500).json({
            error: 'Error al insertar el cliente',
            detail: error.sqlMessage || error.message,
        });
    }
});

app.put('/actualizarCliente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apaterno, amaterno, activo } = req.body;
        const nombresNormalizados = normalizarNombres(nombre, apaterno, amaterno);

        if (!nombresNormalizados) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const cliente = await query.obtenerClientePorId(id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        await query.actualizarPersona(cliente.fk_persona, nombresNormalizados, apaterno || '', amaterno || '');
        await query.actualizarCliente(id, activo === true || activo === 1 || activo === '1');

        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.error("Error en la ruta /actualizarCliente/:id:", error);
        res.status(500).json({
            error: 'Error al actualizar el cliente',
            detail: error.sqlMessage || error.message,
        });
    }
});

// app.listen inicia el servidor en el puerto definido en PORT y muestra un mensaje en la consola.
// La función de flecha () => {} es una función anónima que se ejecuta cuando el servidor se inicia correctamente.
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});