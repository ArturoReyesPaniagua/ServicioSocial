// verify-env-config.js
// Script para verificar que la configuración del .env se está cargando correctamente
require('dotenv').config();
const sql = require('mssql');
const dbConfig = require('./db/config');

console.log('=== Verificación de configuración de entorno ===');
console.log('Variables de entorno cargadas:');
console.log(`PORT: ${process.env.PORT}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_SERVER: ${process.env.DB_SERVER}`);
console.log(`DB_DATABASE: ${process.env.DB_DATABASE}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_ENCRYPT: ${process.env.DB_ENCRYPT}`);
console.log(`DB_TRUST_SERVER_CERT: ${process.env.DB_TRUST_SERVER_CERT}`);

console.log('\nConfiguración de base de datos cargada desde db/config.js:');
console.log({
  user: dbConfig.user,
  server: dbConfig.server,
  database: dbConfig.database,
  port: dbConfig.port,
  options: {
    encrypt: dbConfig.options.encrypt,
    trustServerCertificate: dbConfig.options.trustServerCertificate
  }
});

async function testDBConnection() {
  try {
    console.log('\nIntentando conectar a SQL Server con la configuración cargada...');
    const pool = await sql.connect(dbConfig);
    console.log('¡CONEXIÓN EXITOSA! La configuración del .env está funcionando correctamente.');
    
    // Intentar una consulta simple
    const result = await pool.request().query('SELECT @@version as version');
    console.log('\nVersión de SQL Server:');
    console.log(result.recordset[0].version);
    
    await pool.close();
    console.log('Conexión cerrada correctamente');
  } catch (error) {
    console.error('\nERROR al conectar:');
    console.error(error.message);
    
    console.log('\nSugerencias para resolver el problema:');
    console.log('1. Verifica que el archivo .env contiene los valores correctos');
    console.log('2. Asegúrate de que SQL Server está en ejecución');
    console.log('3. Comprueba que la contraseña de "sa" es correcta');
    console.log('4. Verifica que la instancia SQL Server está configurada correctamente');
  }
}

testDBConnection();