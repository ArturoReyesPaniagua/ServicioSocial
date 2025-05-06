// File: oficioRoutes.js
// SistemaIntegral/backend/routes/oficioRoutes.js
// Este archivo contiene las rutas para la gestión de oficios
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con los oficios

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
  getOficiosArchivados
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
router.get('/oficios/archivado/:archivado', authenticateToken, getOficiosArchivados);

module.exports = router;