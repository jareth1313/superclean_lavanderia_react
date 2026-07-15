//simplemente estamos usando express
const expess = require('express');
const session = require('express-session');
const crypto = require('crypto');

// cors permite que el frontend (que corre en otro puerto) pueda hacer peticiones al backend sin problemas de seguridad.
const cors = require('cors');

// dotenv nos permite cargar las variables de entorno definidas en el archivo .env
// config() carga las variables de entorno para que podamos usarlas en nuestro código.
require('dotenv').config();


const query = require('./query');

//express crea el servidor y lo guarda en la variable app.
const app = expess();

const PORT = 5002;

function hashPassword(password) {
    return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function verifyPassword(password, storedPassword) {
    if (!password || !storedPassword) return false;
    return hashPassword(password) === String(storedPassword) || String(password) === String(storedPassword);
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireAdmin(req, res, next) {
    const rol = String(req.session?.user?.rol || '').trim().toLowerCase();
    if (!req.session?.user || rol !== 'administrador') {
        return res.status(403).json({ ok: false, error: 'Solo el administrador puede realizar esta acción' });
    }
    next();
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

// Usamos cors como middleware para permitir peticiones desde el frontend y permitir cookies.
app.use(cors({ origin: true, credentials: true }));

// session support
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'changeme',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
    }),
);

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

app.post('/insertarUsuario', requireAdmin, async (req, res) => {
    try {
        const { nombres, apaterno, amaterno, usuario, password, rol } = req.body;

        if (!nombres || !usuario || !password) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const fkpersona = await query.insertarPersona(nombres, apaterno || '', amaterno || '');
        await query.insertarUsuario(usuario, hashPassword(password), rol || 'Empleado', fkpersona);

        res.status(201).json({ message: 'Usuario insertado correctamente' });
    } catch (error) {
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
app.put('/actualizarUsuario/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apaterno, amaterno, usuario, password, rol } = req.body;

        if (!nombres || !usuario) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const usuarioActual = await query.obtenerUsuarioPorId(id);
        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const fkPersona = usuarioActual.fk_persona;
        const passwordFinal = password === undefined || password === null || password === ''
            ? usuarioActual.contra
            : hashPassword(password);

        await query.actualizarUsuario(
            id,
            usuario,
            passwordFinal,
            rol || 'Empleado',
            usuarioActual.activo ? 1 : 0,
            fkPersona,
            nombres,
            apaterno || '',
            amaterno || ''
        );

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error("Error en la ruta /actualizarUsuario/:id:", error);
        res.status(500).json({
            error: 'Error al actualizar el usuario',
            detail: error.sqlMessage || error.message,
        });
    }
});

app.put('/darDeBajaUsuario/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioActual = await query.obtenerUsuarioPorId(id);

        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await query.actualizarUsuario(
            id,
            usuarioActual.usuario || '',
            usuarioActual.contra || '',
            usuarioActual.rol || 'Empleado',
            0,
            usuarioActual.fk_persona,
            usuarioActual.nombres || '',
            usuarioActual.apaterno || '',
            usuarioActual.amaterno || ''
        );

        res.json({ message: 'Usuario dado de baja correctamente' });
    } catch (error) {
        console.error("Error en la ruta /darDeBajaUsuario/:id:", error);
        res.status(500).json({
            error: 'Error al dar de baja al usuario',
            detail: error.sqlMessage || error.message,
        });
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

app.post('/login', async (req, res) => {
    try {
        const { usuario, password } = req.body;
        if (!usuario || !password) {
            return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios' });
        }

        const user = await query.obtenerUsuarioPorNombre(usuario);
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Usuario o contrasena incorrectos' });
        }

        if (!verifyPassword(password, user.contra)) {
            return res.status(401).json({ ok: false, error: 'Usuario o contrasena incorrectos' });
        }

        // Save minimal session info
        req.session.user = { id: user.id, usuario: user.usuario, rol: user.rol };

        res.json({ ok: true, user: req.session.user, message: 'Inicio de sesion exitoso' });
    } catch (error) {
        console.error('Error en /login:', error);
        res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ ok: false, error: 'Error al cerrar sesion' });
        res.json({ ok: true });
    });
});