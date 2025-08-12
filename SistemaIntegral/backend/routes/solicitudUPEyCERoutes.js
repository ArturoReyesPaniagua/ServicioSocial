// File: solicitudUPEyCERoutes.js
// SistemaIntegral/backend/routes/solicitudUPEyCERoutes.js
// Este archivo contiene las rutas para la gestión de solicitudes de UPEyCE

const express = require('express');
const router = express.Router();
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





 // createSolicitudUPEyCE,
 // getAllSolicitudes,
 // getSolicitudById,
 //  aprobarSolicitud,
 //  rechazarSolicitud,
 //  cancelarSolicitud,
 //  getSolicitudesPendientes,
 //  getNextUPEyCENumber,
 //  getNotificaciones,
 //  marcarNotificacionLeida,
 //  getEstadisticas
} = require('../controllers/solicitudUPEyCEControllers');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas para solicitudes de UPEyCE
// Crear nueva solicitud (usuarios autenticados)
router.post('/solicitudes-UPEyCE', authenticateToken, createSolicitudUPEyCE);

// Obtener todas las solicitudes (filtradas según el rol del usuario)
router.get('/solicitudes-UPEyCE', authenticateToken, getAllSolicitudes);

// Obtener solicitud por ID
router.get('/solicitudes-UPEyCE/:id', authenticateToken, getSolicitudById);

// Aprobar solicitud (solo administradores)
router.put('/solicitudes-UPEyCE/:id/aprobar', authenticateToken, isAdmin, aprobarSolicitud);

// Rechazar solicitud (solo administradores)
router.put('/solicitudes-UPEyCE/:id/rechazar', authenticateToken, isAdmin, rechazarSolicitud);

// Cancelar solicitud (usuario que la creó o administrador)
router.put('/solicitudes-UPEyCE/:id/cancelar', authenticateToken, cancelarSolicitud);

// Obtener solicitudes pendientes (solo administradores)
router.get('/solicitudes-UPEyCE-pendientes', authenticateToken, isAdmin, getSolicitudesPendientes);

// Rutas para sd
// Obtener notificaciones del usuario
router.get('/notificaciones', authenticateToken, getNotificaciones);

// Marcar notificación como leída
router.put('/notificaciones/:id/leida', authenticateToken, marcarNotificacionLeida);
router.get('/siguiente-numero-UPEyCE/:id_area?', authenticateToken, getNextUPEyCENumberEndpoint);

// Obtener estadísticas (solo administradores)
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

    // Obtener el área del usuario //esto debo moverlo a Controllers
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

    // Verificar en la tabla de UPEyCE existentes
    const existingUPEyCE = await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE)
      .query('SELECT id_UPEyCE FROM UPEyCE WHERE numero_UPEyCE = @numero_UPEyCE');

    if (existingUPEyCE.recordset.length > 0) {
      return res.json({
        disponible: false,
        mensaje: 'Este número UPEyCE ya está en uso'
      });
    }

    // Verificar en solicitudes pendientes o aprobadas del mismo área
    const pendingSolicitud = await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE)
      .input('id_area', sql.Int, userArea)
      .query(`
        SELECT id_solicitud FROM SolicitudUPEyCE 
        WHERE numero_UPEyCE_solicitado = @numero_UPEyCE 
        AND id_area = @id_area 
        AND estado IN ('pendiente', 'aprobado')
      `);

    if (pendingSolicitud.recordset.length > 0) {
      return res.json({
        disponible: false,
        mensaje: 'Ya existe una solicitud pendiente o aprobada con este número en su área'
      });
    }

    // Si llegamos aquí, el número está disponible
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