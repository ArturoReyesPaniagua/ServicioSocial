// File: pdfControllers.js
// SistemaIntegral/backend/controllers/pdfControllers.js
// Este archivo contiene las funciones para la gestión de archivos PDF
// que interactúan con la base de datos y manejan las solicitudes HTTP relacionadas con los PDFs

const mysql = require('mysql2/promise');
const config = require('../db/config');
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

// Crear una conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

// Subir un PDF
const uploadPDF = async (req, res) => {
  let connection;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    // Asegurar que la tabla existe
    await ensurePDFTable();

    connection = await getConnection();

    const { id_oficio } = req.body;
    const nombreArchivo = req.file.originalname || 'documento.pdf';

    // Si se proporciona id_oficio, verificar que exista
    if (id_oficio) {
      const [oficioRows] = await connection.execute(
        'SELECT id_oficio FROM Oficio WHERE id_oficio = ?',
        [id_oficio]
      );
      
      if (oficioRows.length === 0) {
        return res.status(404).json({ message: 'Oficio no encontrado' });
      }
    }

    // Insertar el PDF con o sin asociación a oficio
    const query = id_oficio 
      ? 'INSERT INTO PDF (nombreArchivo, archivo, id_oficio) VALUES (?, ?, ?)'
      : 'INSERT INTO PDF (nombreArchivo, archivo) VALUES (?, ?)';
    
    const params = id_oficio 
      ? [nombreArchivo, req.file.buffer, id_oficio]
      : [nombreArchivo, req.file.buffer];

    const [result] = await connection.execute(query, params);

    res.status(201).json({
      message: 'PDF subido exitosamente',
      idPDF: result.insertId,
      nombreArchivo
    });
  } catch (error) {
    console.error('Error al subir PDF:', error);    
    res.status(500).json({ message: 'Error al procesar el archivo' });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener un PDF específico
const getPDF = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await getConnection();
    const query = 'SELECT nombreArchivo, archivo FROM PDF WHERE idPDF = ?';
    const [rows] = await connection.execute(query, [id]);

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
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener todos los PDFs
const getAllPDFs = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    // No incluimos el campo 'archivo' para evitar cargar datos BLOB pesados
    const query = 'SELECT idPDF, nombreArchivo, id_oficio, fechaSubida FROM PDF';
    const [rows] = await connection.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener PDFs:', error);
    res.status(500).json({ message: 'Error al obtener la lista de PDFs' });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener PDFs por oficio
const getPDFsByOficio = async (req, res) => {
  let connection;
  try {
    const { id_oficio } = req.params;
    
    connection = await getConnection();
    const query = 'SELECT idPDF, nombreArchivo, fechaSubida FROM PDF WHERE id_oficio = ?';
    const [rows] = await connection.execute(query, [id_oficio]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener PDFs del oficio:', error);
    res.status(500).json({ message: 'Error al obtener los archivos del oficio' });
  } finally {
    if (connection) await connection.end();
  }
};

// Eliminar un PDF
const deletePDF = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await getConnection();
    // Verificar que el PDF existe
    const [checkRows] = await connection.execute('SELECT idPDF FROM PDF WHERE idPDF = ?', [id]);
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }
    
    // Eliminar el PDF
    await connection.execute('DELETE FROM PDF WHERE idPDF = ?', [id]);
    
    res.status(200).json({ message: 'PDF eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar PDF:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo' });
  } finally {
    if (connection) await connection.end();
  }
};

// Asociar un PDF existente a un oficio
const associatePDFWithOficio = async (req, res) => {
  let connection;
  try {
    const { idPDF, id_oficio } = req.body;
    
    connection = await getConnection();
    // Verificar que el PDF existe
    const [pdfRows] = await connection.execute('SELECT idPDF FROM PDF WHERE idPDF = ?', [idPDF]);
    if (pdfRows.length === 0) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }
    
    // Verificar que el oficio existe
    const [oficioRows] = await connection.execute('SELECT id_oficio FROM Oficio WHERE id_oficio = ?', [id_oficio]);
    if (oficioRows.length === 0) {
      return res.status(404).json({ message: 'Oficio no encontrado' });
    }
    
    // Actualizar la asociación
    await connection.execute('UPDATE PDF SET id_oficio = ? WHERE idPDF = ?', [id_oficio, idPDF]);
    
    res.status(200).json({ message: 'PDF asociado exitosamente al oficio' });
  } catch (error) {
    console.error('Error al asociar PDF con oficio:', error);
    res.status(500).json({ message: 'Error al asociar el archivo con el oficio' });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  uploadPDF,
  getPDF,
  getAllPDFs,
  getPDFsByOficio,
  deletePDF,
  associatePDFWithOficio
};