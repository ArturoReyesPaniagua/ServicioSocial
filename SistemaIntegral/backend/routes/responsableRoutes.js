// File: responsableRoutes.js
// SistemaIntegral/backend/routes/responsableRoutes.js
// Este archivo contiene las rutas para la gestión de responsables
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con los responsables

const express = require('express');
const router = express.Router();
const {
  createResponsable,
  getAllResponsables,
  getResponsableById,
  updateResponsable,
  deleteResponsable
} = require('../controllers/responsableControllers');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas CRUD básicas para responsables
// Para crear, actualizar y eliminar responsables se requiere autenticación y rol de administrador
router.post('/responsables', authenticateToken, createResponsable);
router.get('/responsables', getAllResponsables);
router.get('/responsables/:id', getResponsableById);
router.put('/responsables/:id', authenticateToken, updateResponsable);
router.delete('/responsables/:id', authenticateToken, isAdmin, deleteResponsable);

module.exports = router;