// SistemaIntegral/backend/db/db.js

const sql = require('mssql');
const config = require('./config');

// Variables para el manejo del pool global
let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      console.log('Iniciando nueva conexión al pool de SQL Server...');
      pool = await sql.connect(config);
      console.log('Conectado exitosamente a la base de datos SQL Server');
    }
    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos SQL Server:', error);
    // En caso de error, asegurar que el pool se reinicia en el próximo intento
    pool = null;
    throw error;
  }
};

// Función para cerrar la conexión cuando sea necesario (por ejemplo, al cerrar la aplicación)
const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Conexión a la base de datos cerrada correctamente');
    }
  } catch (error) {
    console.error('Error al cerrar la conexión a la base de datos:', error);
    throw error;
  }
};

// Función para ejecutar consultas sin exponer el pool directamente
const executeQuery = async (query, parameters = {}) => {
  try {
    const poolConnection = await connectDB();
    const request = poolConnection.request();
    
    // Agregar los parámetros a la consulta
    Object.entries(parameters).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    return await request.query(query);
  } catch (error) {
    console.error('Error al ejecutar consulta:', error);
    throw error;
  }
};

// Manejadores para cierre limpio de la aplicación
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

module.exports = {
  connectDB,
  closePool,
  executeQuery
};