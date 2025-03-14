const express = require('express');
const router = express.Router();
const {
  createEstado,
  getAllEstados,
  getEstadoById,
  updateEstado,
  deleteEstado
} = require('../controllers/estadoControllers');

// Rutas CRUD básicas
router.post('/estados', createEstado);
router.get('/estados', getAllEstados);
router.get('/estados/:id', getEstadoById);
router.put('/estados/:id', updateEstado);
router.delete('/estados/:id', deleteEstado);

module.exports = router;