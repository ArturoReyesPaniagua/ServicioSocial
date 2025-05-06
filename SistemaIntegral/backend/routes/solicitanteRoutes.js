// File: solicitanteRoutes.js
// SistemaIntegral/backend/routes/solicitanteRoutes.js
// Este archivo contiene las rutas para la gestión de solicitantes
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con los solicitantes

const express = require('express');
const router = express.Router();
const {
  createSolicitante,
  getAllSolicitantes,
  getSolicitanteById,
  updateSolicitante,
  deleteSolicitante
} = require('../controllers/solicitanteControllers');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas CRUD básicas para solicitantes
router.post('/solicitantes', authenticateToken, createSolicitante);
router.get('/solicitantes', getAllSolicitantes);
router.get('/solicitantes/:id', getSolicitanteById);
router.put('/solicitantes/:id', authenticateToken, updateSolicitante);
router.delete('/solicitantes/:id', authenticateToken, isAdmin, deleteSolicitante);

module.exports = router;