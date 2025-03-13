const express = require('express');
const router = express.Router();
const {
  createExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente,
  searchExpedientes,
  getExpedientesByStatus
} = require('../controllers/expedientesController');

// Rutas CRUD básicas
router.post('/expedientes', createExpediente);
router.get('/expedientes', getAllExpedientes);
router.get('/expedientes/:id', getExpedienteById);
router.put('/expedientes/:idDia', updateExpediente);
router.delete('/expedientes/:id', deleteExpediente);

// Rutas adicionales
router.get('/expedientes/search/:term', searchExpedientes);
router.get('/expedientes/status/:status', getExpedientesByStatus);

module.exports = router;