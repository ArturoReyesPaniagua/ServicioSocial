//  File expedientesRoutes.js
// SistemaIntegral/backend/routes/expedientesRoutes.js 
// este archivo contiene las rutas para la gestión de expedientes
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con los expedientes

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
  getExpedientesArchivados,
  getAllEstados
} = require('../controllers/expedienteControllers');

// Rutas CRUD básicas para expedientes
router.post('/expedientes', createExpediente);
router.get('/expedientes', getAllExpedientes);
router.get('/expedientes/:id', getExpedienteById);
router.put('/expedientes/:id', updateExpediente);
router.delete('/expedientes/:id', deleteExpediente);

// Rutas adicionales para expedientes
router.get('/expedientes/search/:term', searchExpedientes);
router.get('/expedientes/estado/:estado', getExpedientesByEstado); // Cambiado de idEstado a estado porque se elimino esquema de estados 
router.get('/expedientes/archivado/:archivado', getExpedientesArchivados);

// Rutas para los estados de los expedientes
router.get('/estados', getAllEstados);

module.exports = router;