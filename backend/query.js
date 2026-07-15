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
}

// Exportamos las funciones que definamos en este archivo para usarlas en otros archivos.
module.exports = {
    obtenerUsuarios,
    insertarUsuario,
    insertarPersona,
    obtenerPrendas,
    insertarPrenda,
    actualizarPrenda,
    testConnection
};