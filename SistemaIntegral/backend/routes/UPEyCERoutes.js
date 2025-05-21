// File: oficioRoutes.js
// SistemaIntegral/backend/routes/oficioRoutes.js (actualizado)
// Este archivo contiene las rutas para la gestión de oficios

const express = require('express');
const router = express.Router();
const {
  createOficio,
  getAllOficios,
  getOficioById,
  updateOficio,
  deleteOficio,
  searchOficios,
  getOficiosByEstado,
  getOficiosByArea,
  getOficiosArchivados,
  getOficiosByUPEyCE
} = require('../controllers/oficioControllers');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rutas CRUD básicas para oficios
// Para todos los endpoints se requiere autenticación
router.post('/oficios', authenticateToken, createOficio);
router.get('/oficios', authenticateToken, getAllOficios);
router.get('/oficios/:id', authenticateToken, getOficioById);
router.put('/oficios/:id', authenticateToken, updateOficio);
router.delete('/oficios/:id', authenticateToken, deleteOficio);

// Rutas adicionales para oficios
router.get('/oficios/search/:term', authenticateToken, searchOficios);
router.get('/oficios/estado/:estado', authenticateToken, getOficiosByEstado);
router.get('/oficios/area/:id_area', authenticateToken, getOficiosByArea);
router.get('/oficios/archivado/:archivado', authenticateToken, getOficiosArchivados);
router.get('/oficios/UPEyCE/:id_UPEyCE', authenticateToken, getOficiosByUPEyCE);

module.exports = router;