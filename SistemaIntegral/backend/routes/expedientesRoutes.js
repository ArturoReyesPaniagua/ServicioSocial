const express = require('express');
const router = express.Router();
const {
  createExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente,
  searchExpedientes,
  getExpedientesByEstado,
  getExpedientesArchivados
} = require('../controllers/expedienteControllers');

// Rutas CRUD básicas para expedientes
router.post('/expedientes', createExpediente);
router.get('/expedientes', getAllExpedientes);
router.get('/expedientes/:id', getExpedienteById);
router.put('/expedientes/:id', updateExpediente);
router.delete('/expedientes/:id', deleteExpediente);

// Rutas adicionales para expedientes
router.get('/expedientes/search/:term', searchExpedientes);
router.get('/expedientes/estado/:idEstado', getExpedientesByEstado);
router.get('/expedientes/archivado/:archivado', getExpedientesArchivados);

module.exports = router;