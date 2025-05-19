// SistemaIntegral/backend/test-connection.js
require('dotenv').config();
const sql = require('mssql');
const config = require('./db/config');

async function testConnection() {
  try {
    console.log('Intentando conectar a SQL Server...');
    console.log('Configuración:', {
      server: config.server,
      database: config.database,
      user: config.user,
      port: config.port,
      options: {
        encrypt: config.options.encrypt,
        trustServerCertificate: config.options.trustServerCertificate
      }
    });
    
    const pool = await sql.connect(config);
    console.log('¡Conexión exitosa a SQL Server!');
    
    // Probar una consulta simple
    const result = await pool.request().query('SELECT @@version as version');
    console.log('Versión del servidor SQL Server:');
    console.log(result.recordset[0].version);
    
    await pool.close();
    console.log('Conexión cerrada correctamente');
  } catch (error) {
    console.error('Error al conectar a SQL Server:', error);
  }
}

testConnection();