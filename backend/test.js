require('dotenv').config();
const db = require('./db');

async function test() {
    try {
        // Ver estructura de la tabla
        const [structure] = await db.query(`DESCRIBE prenda`);
        console.log("Estructura de tabla prenda:");
        console.log(structure);
        
        // Ver registros existentes
        const [rows] = await db.query(`SELECT * FROM prenda LIMIT 5`);
        console.log("\nRegistros en prenda:");
        console.log(rows);
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

test();
