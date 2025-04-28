// File: pdfControllers.js
// SistemaIntegral/backend/controllers/pdfControllers.js
//Documento que contiene las funciones de autenticación y gestión de usuarios
// que interactúan con la base de datos y manejan las solicitudes HTTP relacionadas con los usuarios
// **Checar aqui lo del PDF** apartir de la linea 100 ... 

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

    const { idExpediente } = req.body;
    const nombreArchivo = req.file.originalname || 'documento.pdf';

    // Si se proporciona idExpediente, verificar que exista
    if (idExpediente) {
      const [expedienteRows] = await connection.execute(
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

    const [result] = await connection.execute(query, params);

    res.status(201).json({
      message: 'PDF subido exitosamente',
      id: result.insertId,
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
    const query = 'SELECT idPDF, nombreArchivo, idExpediente, fechaSubida FROM PDF';
    const [rows] = await connection.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener PDFs:', error);
    res.status(500).json({ message: 'Error al obtener la lista de PDFs' });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener PDFs por expediente
const getPDFsByExpediente = async (req, res) => {
  let connection;
  try {
    const { idExpediente } = req.params;
    
    connection = await getConnection();
    const query = 'SELECT idPDF, nombreArchivo, fechaSubida FROM PDF WHERE idExpediente = ?';
    const [rows] = await connection.execute(query, [idExpediente]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener PDFs del expediente:', error);
    res.status(500).json({ message: 'Error al obtener los archivos del expediente' });
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

// Asociar un PDF existente a un expediente
const associatePDFWithExpediente = async (req, res) => {
  let connection;
  try {
    const { idPDF, idExpediente } = req.body;
    
    connection = await getConnection();
    // Verificar que el PDF existe
    const [pdfRows] = await connection.execute('SELECT idPDF FROM PDF WHERE idPDF = ?', [idPDF]);
    if (pdfRows.length === 0) {
      return res.status(404).json({ message: 'PDF no encontrado' });
    }
    
    // Verificar que el expediente existe
    const [expRows] = await connection.execute('SELECT idExpediente FROM Expediente WHERE idExpediente = ?', [idExpediente]);
    if (expRows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    
    // Actualizar la asociación
    await connection.execute('UPDATE PDF SET idExpediente = ? WHERE idPDF = ?', [idExpediente, idPDF]);
    
    res.status(200).json({ message: 'PDF asociado exitosamente al expediente' });
  } catch (error) {
    console.error('Error al asociar PDF con expediente:', error);
    res.status(500).json({ message: 'Error al asociar el archivo con el expediente' });
  } finally {
    if (connection) await connection.end();
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