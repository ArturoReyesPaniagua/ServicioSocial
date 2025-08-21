// SistemaIntegral/backend/routes/solicitudUPEyCERoutes.js
// Rutas actualizadas para el sistema de tickets con asignación manual de folios

const express = require('express');
const router = express.Router();

// Importar funciones del controlador
const {
  createSolicitudUPEyCE,
  getAllSolicitudes,
  getSolicitudById,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  getSolicitudesPendientes,
  getSuggestedFolioNumber,  // NUEVA FUNCIÓN
  getNotificaciones,
  marcarNotificacionLeida,
  getEstadisticas
} = require('../controllers/solicitudUPEyCEControllers');

const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// ========================================
// RUTAS PARA SOLICITUDES DE FOLIOS
// ========================================

// Crear nueva solicitud de folio
router.post('/solicitudes-folio', authenticateToken, createSolicitudUPEyCE);

// Obtener todas las solicitudes (usuario ve solo las suyas, admin ve todas)
router.get('/solicitudes-folio', authenticateToken, getAllSolicitudes);

// Obtener solicitud específica por ID
router.get('/solicitudes-folio/:id', authenticateToken, getSolicitudById);

// NUEVA RUTA: Obtener número de folio sugerido para un área
router.get('/sugerir-folio/:id_area', authenticateToken, isAdmin, getSuggestedFolioNumber);

// Obtener solicitudes pendientes (solo administradores)
router.get('/solicitudes-folio-pendientes', authenticateToken, isAdmin, getSolicitudesPendientes);

// ========================================
// RUTAS PARA APROBACIÓN/RECHAZO (ADMIN)
// ========================================

// Aprobar solicitud con asignación manual de folio
router.put('/solicitudes-folio/:id/aprobar', authenticateToken, isAdmin, aprobarSolicitud);

// Rechazar solicitud
router.put('/solicitudes-folio/:id/rechazar', authenticateToken, isAdmin, rechazarSolicitud);

// Cancelar solicitud (usuario o admin)
router.put('/solicitudes-folio/:id/cancelar', authenticateToken, cancelarSolicitud);

// ========================================
// RUTAS PARA NOTIFICACIONES
// ========================================

// Obtener notificaciones del usuario
router.get('/notificaciones', authenticateToken, getNotificaciones);

// Marcar notificación como leída
router.put('/notificaciones/:id/leida', authenticateToken, marcarNotificacionLeida);

// Conteo de notificaciones no leídas (implementación directa)
router.get('/notificaciones/conteo', authenticateToken, async (req, res) => {
  try {
    console.log('📊 === OBTENIENDO CONTEO DE NOTIFICACIONES ===');
    
    const { connectDB } = require('../db/db');
    const sql = require('mssql');
    
    const pool = await connectDB();
    const userId = req.user.userId;
    
    console.log('👤 Usuario solicitando conteo:', userId);
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) as no_leidas FROM Notificaciones WHERE id_usuario = @userId AND leida = 0');
    
    const noLeidas = result.recordset[0].no_leidas;
    console.log('📊 Notificaciones no leídas:', noLeidas);
    
    res.status(200).json({ 
      no_leidas: noLeidas,
      usuario_id: userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo conteo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// RUTAS PARA ESTADÍSTICAS
// ========================================

// Obtener estadísticas de solicitudes
router.get('/estadisticas-folios', authenticateToken, getEstadisticas);

// Ruta de prueba para verificar conexión
router.get('/test-folios', authenticateToken, async (req, res) => {
  try {
    const { connectDB } = require('../db/db');
    const pool = await connectDB();
    
    // Verificar que las tablas existen
    const tablas = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('SolicitudUPEyCE', 'Notificaciones', 'HistorialSolicitudUPEyCE')
    `);
    
    res.status(200).json({
      message: 'Conexión exitosa al sistema de folios',
      tablas_encontradas: tablas.recordset.map(t => t.TABLE_NAME),
      usuario: req.user.username,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;