// SistemaIntegral/backend/server.js - Archivo servidor corregido
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
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARE DE CONFIGURACIÓN
// ========================================

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// CONEXIÓN A BASE DE DATOS
// ========================================

connectDB()
  .then(() => {
    console.log('✅ Conexión a SQL Server establecida correctamente');
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos SQL Server:', err);
    process.exit(1);
  });

// ========================================
// RUTAS DE LA API - DEBEN IR ANTES DEL CATCH-ALL
// ========================================

// Ruta de prueba
app.get('/api', (req, res) => {
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
app.get('/api/health', async (req, res) => {
  try {
    const { connectDB } = require('./db/db');
    const pool = await connectDB();
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
// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
// ========================================

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

// ========================================
// CATCH-ALL ROUTE - DEBE IR AL FINAL
// ========================================

// Ruta catch-all para SPA - DEBE IR DESPUÉS DE TODAS LAS RUTAS DE API
app.get('*', (req, res) => {
  // Solo servir index.html si no es una ruta de API
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Ruta de API no encontrada',
      message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ========================================

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
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

const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log('   SISTEMA INTEGRAL DE GESTIÓN DE OFICIOS');
  console.log('========================================');
  console.log(`🌐 Servidor ejecutándose en el puerto: ${PORT}`);
  console.log(`📍 URL local: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log('========================================\n');
});

// Manejadores para cierre limpio de la aplicación
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

module.exports = app;