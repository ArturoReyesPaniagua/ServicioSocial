// File: areaRoutes.js
// SistemaIntegral/backend/routes/areaRoutes.js
// Este archivo contiene las rutas para la gestión de áreas
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con las áreas

const express = require('express');
const router = express.Router();
const {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea
} = require('../controllers/areaControllers');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas CRUD básicas para áreas
// Para crear y eliminar áreas se requiere autenticación y rol de administrador
router.post('/areas', authenticateToken, isAdmin, createArea);
router.get('/areas', getAllAreas);
router.get('/areas/:id', getAreaById);
router.put('/areas/:id', authenticateToken, isAdmin, updateArea);
router.delete('/areas/:id', authenticateToken, isAdmin, deleteArea);

module.exports = router;