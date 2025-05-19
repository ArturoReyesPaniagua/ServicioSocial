// SistemaIntegral/backend/db/config.js
// Configuración para SQL Server que usa exclusivamente variables de entorno

// Cargar variables de entorno
require('dotenv').config();

// Configuración para SQL Server
const dbconfig = { 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true',
    connectTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Para propósitos de pruebas, mostramos la configuración (sin la contraseña)
console.log('Configuración de conexión a SQL Server:', {
  user: dbconfig.user,
  server: dbconfig.server,
  database: dbconfig.database,
  port: dbconfig.port,
  options: {
    encrypt: dbconfig.options.encrypt,
    trustServerCertificate: dbconfig.options.trustServerCertificate
  }
});

module.exports = dbconfig;