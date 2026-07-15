//Importamos la conexión a la base de datos.
//Que definimos en el archivo db.js
//En este archivo vamos a escribir las consultas a la base de datos.
const db = require('./db');

async function obtenerUsuarios(){
    // [rows] guarda las filas que regresa la consulta.
    // await db.query() ejecuta la consulta a la base de datos y espera a que se complete antes de continuar con el código.
    const [rows] = await db.query(`
        SELECT
            u.pk_usuario AS id,
            p.nombres,
            p.apaterno, 
            p.amaterno,
            u.nom_usu AS usuario,
            u.rol,
            u.estatus_usu AS activo
        FROM usuario u
        LEFT JOIN persona p ON p.pk_persona = u.fk_persona
    `);

    //regresa las filas obtenidas de la consulta.
    return rows;
}

async function insertarUsuario(nomUsu, password, rol, fkPersona){ 
    const [rows] = await db.query('INSERT INTO usuario (nom_usu, contra_usu, rol, estatus_usu, fk_persona) \
        VALUES (?, ?, ?, 1, ?)', [nomUsu, password, rol, fkPersona]
    );
    return rows;
}

async function actualizarUsuario(pkUsuario, nomUsu, password, rol, activo, fkPersona, nombres, apaterno, amaterno){ 
    const [rows] = await db.query(`
        UPDATE usuario u
        LEFT JOIN persona p ON p.pk_persona = u.fk_persona
        SET 
            u.nom_usu = ?,
            u.contra_usu = ?,
            u.rol = ?,
            u.estatus_usu = ?,
            p.nombres = ?,
            p.apaterno = ?,
            p.amaterno = ?
        WHERE u.pk_usuario = ?
    `,
        [nomUsu, password, rol, activo, nombres, apaterno, amaterno, pkUsuario]
    );
    return rows;
}

async function obtenerUsuarioPorId(pkUsuario){
    const [rows] = await db.query(`
        SELECT
            u.pk_usuario AS id,
            u.fk_persona,
            p.nombres,
            p.apaterno,
            p.amaterno,
            u.nom_usu AS usuario,
            u.contra_usu AS contra,
            u.rol,
            u.estatus_usu AS activo
        FROM usuario u
        LEFT JOIN persona p ON p.pk_persona = u.fk_persona
        WHERE u.pk_usuario = ?
        LIMIT 1
    `, [pkUsuario]);
    return rows[0];
}

async function obtenerUsuarioPorNombre(nomUsu){
    const [rows] = await db.query(`
        SELECT
            u.pk_usuario AS id,
            p.pk_persona AS fk_persona,
            p.nombres,
            p.apaterno,
            p.amaterno,
            u.nom_usu AS usuario,
            u.contra_usu AS contra,
            u.rol,
            u.estatus_usu AS activo
        FROM usuario u
        LEFT JOIN persona p ON p.pk_persona = u.fk_persona
        WHERE u.nom_usu = ?
        LIMIT 1
    `, [nomUsu]);
    return rows[0];
}

// Fin Módulo Usuarios -----------------------------------------------------------------------------------------------------------------

async function obtenerClientes(){
    const [rows] = await db.query(`
        SELECT
            c.pk_cliente AS id,
            p.nombres,
            p.apaterno,
            p.amaterno,
            TRIM(CONCAT(
                COALESCE(p.nombres, ''),
                CASE WHEN COALESCE(p.apaterno, '') <> '' THEN CONCAT(' ', p.apaterno) ELSE '' END,
                CASE WHEN COALESCE(p.amaterno, '') <> '' THEN CONCAT(' ', p.amaterno) ELSE '' END
            )) AS nombre,
            '' AS telefono,
            '' AS email,
            '' AS direccion,
            c.estatus_cliente AS activo,
            NULL AS creado,
            c.fk_persona
        FROM cliente c
        LEFT JOIN persona p ON p.pk_persona = c.fk_persona
        ORDER BY c.pk_cliente DESC
    `);

    return rows;
}

async function insertarPersona(nombres, apaterno, amaterno){ 
    const [rows] = await db.query('INSERT INTO persona (nombres, apaterno, amaterno) \
        VALUES (?, ?, ? )', [nombres, apaterno, amaterno]
    );
    return rows.insertId;
}





async function insertarCliente(fkPersona){
    const [rows] = await db.query('INSERT INTO cliente (estatus_cliente, fk_persona) \
        VALUES (1, ?)', [fkPersona]
    );
    return rows;
}

async function actualizarPersona(pkPersona, nombres, apaterno, amaterno){
    const [rows] = await db.query('UPDATE persona SET nombres = ?, apaterno = ?, amaterno = ? WHERE pk_persona = ?',
        [nombres, apaterno, amaterno, pkPersona]
    );
    return rows;
}

async function actualizarCliente(pkCliente, activo){
    const [rows] = await db.query('UPDATE cliente SET estatus_cliente = ? WHERE pk_cliente = ?',
        [activo ? 1 : 0, pkCliente]
    );
    return rows;
}

// ---- Prendas ----
async function obtenerPrendas(){
    const [rows] = await db.query(`
        SELECT
            pk_prenda AS id,
            nom_prenda AS nombre,
            COALESCE(descripcion_prenda, '') AS descripcion,
            precio_prenda AS precio,
            COALESCE(estatus_prenda, 1) AS activo
        FROM prenda
        ORDER BY nom_prenda ASC
    `);
    return rows.map(p => ({
        ...p,
        activo: p.activo === 1 || p.activo === true
    }));
}

async function insertarPrenda(nomPrenda, descripcion, precio){
    try {
        // Convertir valores a tipos correctos
        const nom = String(nomPrenda).trim();
        const desc = String(descripcion || '').trim();
        const prec = parseFloat(precio) || 0;
        
        if (!nom) throw new Error('El nombre de la prenda es obligatorio');
        if (prec <= 0) throw new Error('El precio debe ser mayor a 0');
        
        const [rows] = await db.query(
            'INSERT INTO prenda (nom_prenda, descripcion_prenda, precio_prenda, estatus_prenda) VALUES (?, ?, ?, 1)',
            [nom, desc, prec]
        );
        return rows.insertId;
    } catch (error) {
        console.error("❌ Error en insertarPrenda:", {
            message: error.message,
            code: error.code,
            sql: error.sql
        });
        throw error;
    }
}

async function actualizarPrenda(pkPrenda, nomPrenda, descripcion, precio, estatus){
    try {
        const nom = String(nomPrenda).trim();
        const desc = String(descripcion || '').trim();
        const prec = parseFloat(precio) || 0;
        const est = estatus ? 1 : 0;
        
        const [rows] = await db.query(
            'UPDATE prenda SET nom_prenda = ?, descripcion_prenda = ?, precio_prenda = ?, estatus_prenda = ? WHERE pk_prenda = ?',
            [nom, desc, prec, est, pkPrenda]
        );
        return rows;
    } catch (error) {
        console.error("❌ Error en actualizarPrenda:", error.message);
        throw error;
    }
}

async function testConnection(){
    const [structure] = await db.query('DESCRIBE prenda');
    return structure;
async function obtenerClientePorId(pkCliente){
    const [rows] = await db.query('SELECT pk_cliente, fk_persona FROM cliente WHERE pk_cliente = ?', [pkCliente]);
    return rows[0];
}

// Exportamos las funciones que definamos en este archivo para usarlas en otros archivos.
module.exports = {
    obtenerUsuarios,
    obtenerClientes,
    obtenerUsuarioPorNombre,
    insertarUsuario,
    insertarPersona,
    obtenerPrendas,
    insertarPrenda,
    actualizarPrenda,
    testConnection
    actualizarUsuario,
    insertarPersona,
    insertarCliente,
    actualizarPersona,
    actualizarCliente,
    obtenerClientePorId,
    obtenerUsuarioPorId
};