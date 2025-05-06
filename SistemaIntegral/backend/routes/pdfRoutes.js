// File: pdfRoutes.js
// SistemaIntegral/backend/routes/pdfRoutes.js
// Este archivo contiene las rutas para la gestión de archivos PDF
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con los PDFs

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { authenticateToken } = require('../middleware/authMiddleware');

// Import PDF controller
const { 
  uploadPDF, 
  getPDF, 
  getAllPDFs,
  getPDFsByOficio,
  deletePDF,
  associatePDFWithOficio
} = require('../controllers/pdfControllers');

// Define routes with their handler functions
// Para todos los endpoints excepto obtener un PDF específico se requiere autenticación
router.post('/pdfs/upload', authenticateToken, upload.single('pdf'), uploadPDF);
router.get('/pdfs/:id', getPDF); // No requiere autenticación para permitir links directos
router.get('/pdfs', authenticateToken, getAllPDFs);
router.get('/pdfs/oficio/:id_oficio', authenticateToken, getPDFsByOficio);
router.delete('/pdfs/:id', authenticateToken, deletePDF);
router.post('/pdfs/associate', authenticateToken, associatePDFWithOficio);

module.exports = router;