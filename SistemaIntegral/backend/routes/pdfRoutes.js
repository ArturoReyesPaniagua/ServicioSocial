const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// Import PDF controller
const { 
    uploadPDF, 
    getPDF, 
    getAllPDFs,
    getPDFsByExpediente,
    deletePDF,
    associatePDFWithExpediente
} = require('../controllers/pdfControllers');

// Define routes with their handler functions
router.post('/upload-pdf', upload.single('pdf'), uploadPDF);
router.get('/pdf/:id', getPDF);
router.get('/pdfs', getAllPDFs);
router.get('/pdfs/expediente/:idExpediente', getPDFsByExpediente);
router.delete('/pdfs/:id', deletePDF);
router.post('/pdfs/associate', associatePDFWithExpediente);

module.exports = router;