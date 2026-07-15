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

// ---- Prendas ----
app.get('/test-db', async (req, res) => {
    try {
        const [structure] = await query.testConnection();
        res.json({ ok: true, structure });
    } catch (error) {
        console.error("Error en /test-db:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/obtenerPrendas', async (req, res) => {
    try {
        const prendas = await query.obtenerPrendas();
        res.json(prendas);
    } catch (error) {
        console.error("Error en la ruta /obtenerPrendas:", error);
        res.status(500).json({ error: 'Error al obtener las prendas' });
    }
});

app.post('/insertarPrenda', async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body;

        if (!nombre || !precio) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const resultado = await query.insertarPrenda(nombre, descripcion || '', Number(precio));
        res.status(201).json({ message: 'Prenda insertada correctamente', id: resultado });
    } catch (error) {
        console.error("Error en /insertarPrenda:");
        console.error("  Mensaje:", error.message);
        console.error("  Código:", error.code);
        console.error("  SQL:", error.sql);
        console.error("  Datos recibidos:", req.body);
        
        res.status(500).json({ 
            error: 'Error al insertar la prenda',
            details: error.message,
            code: error.code
        });
    }
});

app.put('/actualizarPrenda/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, activo } = req.body;

        if (!nombre || !precio) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        await query.actualizarPrenda(id, nombre, descripcion || '', Number(precio), activo ? 1 : 0);
        res.json({ message: 'Prenda actualizada correctamente' });
    } catch (error) {
        console.error("Error en la ruta /actualizarPrenda:", error);
        res.status(500).json({ error: 'Error al actualizar la prenda' });
    }
});

// app.listen inicia el servidor en el puerto definido en PORT y muestra un mensaje en la consola.
// La función de flecha () => {} es una función anónima que se ejecuta cuando el servidor se inicia correctamente.
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});