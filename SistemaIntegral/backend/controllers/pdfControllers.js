const db = require('../db/db');
const pdfSchema = require('../schemas/pdfSchema');
const { createTable } = require('../utils/funtiosauth');

// Asegurar que la tabla existe
const ensurePDFTable = async () => {
  try {
    await createTable(pdfSchema);
  } catch (error) {
    console.error('Error creando tabla PDF:', error);
    throw error;
  }
};

// Subir un PDF
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    // Asegurar que la tabla existe
    await ensurePDFTable();

    const { idExpediente } = req.body;
    const nombreArchivo = req.file.originalname || 'documento.pdf';

    // Si se proporciona idExpediente, verificar que exista
    if (idExpediente) {
      const [expedienteRows] = await db.execute(
        'SELECT idExpediente FROM Expediente WHERE idExpediente = ?',
        [idExpediente]
      );
      
      if (expedienteRows.length === 0) {
        return res.status(404).json({ message: 'Expediente no encontrado' });
      }
    }

    // Insertar el PDF con o sin asociación a expediente
    const query = idExpediente 
      ? 'INSERT INTO PDF (nombreArchivo, archivo, idExpediente) VALUES (?, ?, ?)'
      : 'INSERT INTO PDF (nombreArchivo, archivo) VALUES (?, ?)';
    
    const params = idExpediente 
      ? [nombreArchivo, req.file.buffer, idExpediente]
      : [nombreArchivo, req.file.buffer];

    const [result] = await db.execute(query, params);

    res.status(201).json({
      message: 'PDF subido exitosamente',
      id: result.insertId,
      nombreArchivo
    });
  } catch (error) {
    console.error('Error al subir PDF:', error);    
    res.status(500).json({ message: 'Error al procesar el archivo' });
  }
};

// Obtener un PDF específico
const getPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT nombreArchivo, archivo FROM PDF WHERE idPDF = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }

    // Configurar la respuesta con el nombre de archivo y el tipo de contenido
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${rows[0].nombreArchivo}`);
    res.send(rows[0].archivo);
  } catch (error) {
    console.error('Error al obtener PDF:', error);
    res.status(500).json({ message: 'Error al obtener el archivo' });
  }
};

// Obtener todos los PDFs
const getAllPDFs = async (req, res) => {
  try {
    const query = 'SELECT idPDF, nombreArchivo, idExpediente, fechaSubida FROM PDF';
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener PDFs:', error);
    res.status(500).json({ message: 'Error al obtener la lista de PDFs' });
  }
};

// Obtener PDFs por expediente
const getPDFsByExpediente = async (req, res) => {
  try {
    const { idExpediente } = req.params;
    const query = 'SELECT idPDF, nombreArchivo, fechaSubida FROM PDF WHERE idExpediente = ?';
    const [rows] = await db.execute(query, [idExpediente]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener PDFs del expediente:', error);
    res.status(500).json({ message: 'Error al obtener los archivos del expediente' });
  }
};

// Eliminar un PDF
const deletePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el PDF existe
    const [checkRows] = await db.execute('SELECT idPDF FROM PDF WHERE idPDF = ?', [id]);
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }
    
    // Eliminar el PDF
    await db.execute('DELETE FROM PDF WHERE idPDF = ?', [id]);
    
    res.status(200).json({ message: 'PDF eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar PDF:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo' });
  }
};

// Asociar un PDF existente a un expediente
const associatePDFWithExpediente = async (req, res) => {
  try {
    const { idPDF, idExpediente } = req.body;
    
    // Verificar que el PDF existe
    const [pdfRows] = await db.execute('SELECT idPDF FROM PDF WHERE idPDF = ?', [idPDF]);
    if (pdfRows.length === 0) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }
    
    // Verificar que el expediente existe
    const [expRows] = await db.execute('SELECT idExpediente FROM Expediente WHERE idExpediente = ?', [idExpediente]);
    if (expRows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    
    // Actualizar la asociación
    await db.execute('UPDATE PDF SET idExpediente = ? WHERE idPDF = ?', [idExpediente, idPDF]);
    
    res.status(200).json({ message: 'PDF asociado exitosamente al expediente' });
  } catch (error) {
    console.error('Error al asociar PDF con expediente:', error);
    res.status(500).json({ message: 'Error al asociar el archivo con el expediente' });
  }
};

module.exports = {
  uploadPDF,
  getPDF,
  getAllPDFs,
  getPDFsByExpediente,
  deletePDF,
  associatePDFWithExpediente
};