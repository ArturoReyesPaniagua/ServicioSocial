// SistemaIntegral/backend/db/config.js

// Configuración para SQL Server
const dbconfig = { 
  user: "sa",                    // Usuario de SQL Server (superadministrador)
  password: "Polopolo123",       // Contraseña
  server: "localhost",           // Nombre del servidor
  port: 1433,                    // Puerto predeterminado de SQL Server
  database: "ssdb",              // Base de datos (servicio social data base)
  options: {
    encrypt: false,              // Cambiar a true si usas Azure o requieres conexión cifrada
    trustServerCertificate: true, // Para desarrollo local (evita errores de certificado)
    enableArithAbort: true,      // Recomendado para consistencia
    instanceName: "",            // Dejar vacío si no usas una instancia con nombre
    connectTimeout: 30000,       // Tiempo de espera para la conexión (30 segundos)
    requestTimeout: 30000        // Tiempo de espera para las solicitudes (30 segundos)
  },
  pool: {
    max: 10,                     // Número máximo de conexiones en el pool
    min: 0,                      // Número mínimo de conexiones en el pool
    idleTimeoutMillis: 30000     // Tiempo máximo de inactividad para una conexión
  }
};

module.exports = dbconfig;