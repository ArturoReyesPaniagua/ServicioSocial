// SistemaIntegral/backend/server.js - Archivo servidor completo
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/db');
const path = require('path');
// Importar todas las rutas
const oficioRoutes = require('./routes/oficioRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const authRoutes = require('./routes/authRoutes');
const areaRoutes = require('./routes/areaRoutes');
const responsableRoutes = require('./routes/responsableRoutes');
const solicitanteRoutes = require('./routes/solicitanteRoutes');
const UPEyCERoutes = require('./routes/UPEyCERoutes');
const solicitudUPEyCERoutes = require('./routes/solicitudUPEyCERoutes');

// Cargar variables de entorno
require('dotenv').config();

const app = express();
// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta para servir el index.html en cualquier ruta (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARE DE CONFIGURACIÓN
// ========================================

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Puertos comunes para React/Vite
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear datos de formulario codificados en URL
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración para manejar archivos de gran tamaño (PDFs, etc.)
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

// Middleware para logging de requests (opcional para desarrollo)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// CONEXIÓN A BASE DE DATOS
// ========================================

// Inicializar conexión a SQL Server
connectDB()
  .then(() => {
    console.log('✅ Conexión a SQL Server establecida correctamente');
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos SQL Server:', err);
    process.exit(1);
  });

// ========================================
// CONFIGURACIÓN DE RUTAS
// ========================================

// Ruta de prueba
app.get('/', (req, res) => {
  
  res.json({
    message: 'API del Sistema Integral de Gestión de Oficios funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      oficios: '/api/oficios/*',
      pdfs: '/api/pdfs/*',
      areas: '/api/areas/*',
      responsables: '/api/responsables/*',
      solicitantes: '/api/solicitantes/*',
      upeyc: '/api/UPEyCE/*',
      solicitudes: '/api/solicitudes-upeyc/*',
      notificaciones: '/api/notificaciones/*'
      }
  });

});

// Ruta de health check
app.get('/health', async (req, res) => {
  try {
    const { connectDB } = require('./db/db');
    const pool = await connectDB();
    
    // Probar la conexión con una consulta simple
    await pool.request().query('SELECT 1 as test');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ========================================
// RUTAS DE LA API
// ========================================

// Rutas de autenticación (login, registro, gestión de usuarios)
app.use('/api/auth', authRoutes);

// Rutas de gestión de oficios
app.use('/api', oficioRoutes);

// Rutas de gestión de PDFs
app.use('/api', pdfRoutes);

// Rutas de gestión de áreas
app.use('/api', areaRoutes);

// Rutas de gestión de responsables
app.use('/api', responsableRoutes);

// Rutas de gestión de solicitantes
app.use('/api', solicitanteRoutes);

// Rutas de gestión de UPEyCE
app.use('/api', UPEyCERoutes);

// Rutas de gestión de solicitudes UPEyCE y notificaciones
app.use('/api', solicitudUPEyCERoutes);

// ========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ========================================

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/oficios',
      'POST /api/oficios',
      'GET /api/areas',
      'GET /api/responsables',
      'GET /api/solicitantes',
      'GET /api/UPEyCE',
      'GET /api/solicitudes-upeyc',
      'POST /api/solicitudes-upeyc'
    ]
  });
});

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // No enviar stack trace en producción
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: 'Error interno del servidor',
    message: error.message || 'Ha ocurrido un error inesperado',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// ========================================
// INICIALIZACIÓN DEL SERVIDOR
// ========================================

// Iniciar el servidor

const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log('   SISTEMA INTEGRAL DE GESTIÓN DE OFICIOS');
  console.log('========================================');
  console.log(`🌐 Servidor ejecutándose en el puerto: ${PORT}`);
  console.log(`📍 URL local: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log('========================================\n');
  
  // Mostrar información de la base de datos
  console.log('📊 Configuración de Base de Datos:');
  console.log(`   Servidor: ${process.env.DB_SERVER || 'localhost'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || '1433'}`);
  console.log(`   Base de datos: ${process.env.DB_DATABASE || 'ssdb'}`);
  console.log(`   Usuario: ${process.env.DB_USER || 'sa'}`);
  console.log('========================================\n');
  
  // Mostrar rutas principales disponibles
  console.log('🛣️  Rutas principales disponibles:');
  console.log('   📝 Autenticación: /api/auth/*');
  console.log('   📋 Oficios: /api/oficios/*');
  console.log('   📎 PDFs: /api/pdfs/*');
  console.log('   🏢 Áreas: /api/areas/*');
  console.log('   👥 Responsables: /api/responsables/*');
  console.log('   👤 Solicitantes: /api/solicitantes/*');
  console.log('   🔖 UPEyCE: /api/UPEyCE/*');
  console.log('   📨 Solicitudes: /api/solicitudes-upeyc/*');
  console.log('   🔔 Notificaciones: /api/notificaciones/*');
  console.log('========================================\n');
});

// ========================================
// MANEJO DE SEÑALES DE CIERRE
// ========================================

// Función para cierre limpio del servidor
const gracefulShutdown = async (signal) => {
  console.log(`\n📤 Recibida señal ${signal}. Iniciando cierre limpio...`);
  
  // Cerrar el servidor HTTP
  server.close(async () => {
    console.log('🔌 Servidor HTTP cerrado');
    
    try {
      // Cerrar conexiones de base de datos
      const { closePool } = require('./db/db');
      await closePool();
      console.log('💾 Conexiones de base de datos cerradas correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar conexiones de base de datos:', error);
    }
    
    console.log('✅ Cierre limpio completado');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos si no se completa
  setTimeout(() => {
    console.log('⏰ Forzando cierre después de 10 segundos...');
    process.exit(1);
  }, 10000);
};

// Manejar señales de cierre del sistema
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
  gracefulShutdown('unhandledRejection');
});

// Exportar app para testing (opcional)
module.exports = app;