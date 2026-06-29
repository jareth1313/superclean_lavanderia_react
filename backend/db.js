// mysql/promise  nos permite usar las consultas, async/await
const mysql = require('mysql2/promise');

//createPool crea un grupo de conexiones a la base de datos.
//Reutiliza en vez de abrir y cerrar conexiones cada vez que se hace una consulta.

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


module.exports = db;