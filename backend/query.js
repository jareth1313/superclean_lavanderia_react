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

async function insertarUsuario(nomUsu, password, rol, fkPersona){ 
    const [rows] = await db.query('INSERT INTO usuario (nom_usu, contra_usu, rol, estatus_usu, fk_persona) \
        VALUES (?, ?, ?, 1, ?)', [nomUsu, password, rol, fkPersona]
    );
    return rows;
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

async function obtenerClientePorId(pkCliente){
    const [rows] = await db.query('SELECT pk_cliente, fk_persona FROM cliente WHERE pk_cliente = ?', [pkCliente]);
    return rows[0];
}
// Exportamos las funciones que definamos en este archivo para usarlas en otros archivos.
module.exports = {
    obtenerUsuarios,
    obtenerClientes,
    insertarUsuario,
    insertarPersona,
    insertarCliente,
    actualizarPersona,
    actualizarCliente,
    obtenerClientePorId
};