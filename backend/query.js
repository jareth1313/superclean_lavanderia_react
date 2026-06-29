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
// Exportamos las funciones que definamos en este archivo para usarlas en otros archivos.
module.exports = {
    obtenerUsuarios,
    insertarUsuario,
    insertarPersona
};