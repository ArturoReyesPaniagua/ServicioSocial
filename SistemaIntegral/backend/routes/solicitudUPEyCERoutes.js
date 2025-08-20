// SistemaIntegral/backend/routes/solicitudUPEyCERoutes.js
// Versión compatible que funciona con el controlador actual

const express = require('express');
const router = express.Router();

// IMPORTAR SOLO LAS FUNCIONES QUE EXISTEN
const {
  createSolicitudUPEyCE,
  getAllSolicitudes,
  getSolicitudById,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  getSolicitudesPendientes,
  getNextUPEyCENumberEndpoint,
  getNotificaciones,
  marcarNotificacionLeida,
  getEstadisticas
} = require('../controllers/solicitudUPEyCEControllers');

const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas para solicitudes de UPEyCE
router.post('/solicitudes-UPEyCE', authenticateToken, createSolicitudUPEyCE);
router.get('/solicitudes-UPEyCE', authenticateToken, getAllSolicitudes);
router.get('/solicitudes-UPEyCE/:id', authenticateToken, getSolicitudById);
router.put('/solicitudes-UPEyCE/:id/aprobar', authenticateToken, isAdmin, aprobarSolicitud);
router.put('/solicitudes-UPEyCE/:id/rechazar', authenticateToken, isAdmin, rechazarSolicitud);
router.put('/solicitudes-UPEyCE/:id/cancelar', authenticateToken, cancelarSolicitud);
router.get('/solicitudes-UPEyCE-pendientes', authenticateToken, isAdmin, getSolicitudesPendientes);
router.get('/siguiente-numero-UPEyCE/:id_area?', authenticateToken, isAdmin, getNextUPEyCENumberEndpoint);

// Rutas para notificaciones
router.get('/notificaciones', authenticateToken, getNotificaciones);
router.put('/notificaciones/:id/leida', authenticateToken, marcarNotificacionLeida);

// NUEVA RUTA: Conteo de notificaciones (implementación directa)
router.get('/notificaciones/conteo', authenticateToken, async (req, res) => {
  try {
    console.log('📊 === OBTENIENDO CONTEO DE NOTIFICACIONES (RUTA DIRECTA) ===');
    
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
    console.error('❌ Error obteniendo conteo de notificaciones:', error);
    res.status(500).json({ 
      error: error.message,
      no_leidas: 0,
      usuario_id: req.user?.userId 
    });
  }
});

// Rutas para estadísticas
router.get('/estadisticas-solicitudes', authenticateToken, isAdmin, getEstadisticas);

// Ruta adicional para verificar disponibilidad de número UPEyCE
router.post('/verificar-numero-UPEyCE', authenticateToken, async (req, res) => {
  try {
    const { numero_UPEyCE } = req.body;
    const { connectDB } = require('../db/db');
    const sql = require('mssql');
    
    if (!numero_UPEyCE) {
      return res.status(400).json({ 
        disponible: false, 
        mensaje: 'Debe proporcionar un número UPEyCE' 
      });
    }

    const pool = await connectDB();
    const userId = req.user.userId;

    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id_area FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ 
        disponible: false, 
        mensaje: 'Usuario no encontrado' 
      });
    }

    const userArea = userResult.recordset[0].id_area;

    const existingUPEyCE = await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE)
      .query('SELECT id_UPEyCE FROM UPEyCE WHERE numero_UPEyCE = @numero_UPEyCE');

    if (existingUPEyCE.recordset.length > 0) {
      return res.json({
        disponible: false,
        mensaje: 'Este número UPEyCE ya está en uso'
      });
    }

    const pendingSolicitud = await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE)
      .input('id_area', sql.Int, userArea)
      .query(`
        SELECT id_solicitud FROM SolicitudUPEyCE 
        WHERE numero_UPEyCE_asignado = @numero_UPEyCE 
        AND id_area = @id_area 
        AND estado IN ('pendiente', 'aprobado')
      `);

    if (pendingSolicitud.recordset.length > 0) {
      return res.json({
        disponible: false,
        mensaje: 'Ya existe una solicitud pendiente o aprobada con este número en su área'
      });
    }

    res.json({
      disponible: true,
      mensaje: 'Número disponible'
    });

  } catch (error) {
    console.error('Error verificando número UPEyCE:', error);
    res.status(500).json({ 
      disponible: false, 
      mensaje: 'Error interno del servidor' 
    });
  }
});

module.exports = router;