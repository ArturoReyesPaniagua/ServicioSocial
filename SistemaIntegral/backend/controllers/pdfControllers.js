// SistemaIntegral/backend/controllers/pdfControllers.js 

// controlador para manejar las operaciones CRUD de PDFs 


const sql = require('mssql');
const pdfSchema = require('../schemas/pdfSchema');
const { connectDB } = require('../db/db');

// Subir un archivo PDF
const uploadPDF = async (req, res) => {
  try {
    // Asegurar que la tabla exista
    const pool = await connectDB();
    await pool.request().query(pdfSchema);

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const { originalname } = req.file;
    const { id_oficio } = req.body;

    // Verificar que el oficio existe si se proporciona
    if (id_oficio) {
      const oficioCheck = await pool.request()
        .input('id_oficio', sql.Int, id_oficio)
        .query('SELECT * FROM Oficio WHERE id_oficio = @id_oficio');

      if (oficioCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Oficio no encontrado' });
      }
    }

    // Insertar el PDF en la base de datos
    const result = await pool.request()
      .input('nombreArchivo', sql.NVarChar, originalname)
      .input('archivo', sql.VarBinary, req.file.buffer)
      .input('id_oficio', sql.Int, id_oficio || null)
      .query(`
        INSERT INTO PDF (nombreArchivo, archivo, id_oficio) 
        VALUES (@nombreArchivo, @archivo, @id_oficio);
        SELECT SCOPE_IDENTITY() AS idPDF;
      `);

    res.status(201).json({
      message: 'PDF subido exitosamente',
      idPDF: result.recordset[0].idPDF
    });
  } catch (error) {
    console.error('Error al subir PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un PDF específico
const getPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT nombreArchivo, archivo FROM PDF WHERE idPDF = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }

    const pdf = result.recordset[0];
    
    // Configurar los encabezados para la descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.nombreArchivo}"`);
    
    // Enviar el PDF
    res.send(pdf.archivo);
  } catch (error) {
    console.error('Error al obtener PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los PDFs
const getAllPDFs = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT 
        p.idPDF, 
        p.nombreArchivo, 
        p.fechaSubida, 
        p.id_oficio,
        o.numero_de_oficio,
        o.asunto
      FROM 
        PDF p
      LEFT JOIN 
        Oficio o ON p.id_oficio = o.id_oficio
      ORDER BY 
        p.fechaSubida DESC
    `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener PDFs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener PDFs de un oficio específico
const getPDFsByOficio = async (req, res) => {
  try {
    const { id_oficio } = req.params;
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('id_oficio', sql.Int, id_oficio)
      .query(`
        SELECT 
          idPDF, 
          nombreArchivo, 
          fechaSubida 
        FROM 
          PDF 
        WHERE 
          id_oficio = @id_oficio
        ORDER BY 
          fechaSubida DESC
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener PDFs por oficio:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un PDF
const deletePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Verificar que el PDF existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM PDF WHERE idPDF = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }

    // Eliminar el PDF
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM PDF WHERE idPDF = @id');

    res.status(200).json({ message: 'PDF eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

// Asociar un PDF existente con un oficio
const associatePDFWithOficio = async (req, res) => {
  try {
    const { idPDF, id_oficio } = req.body;
    
    if (!idPDF || !id_oficio) {
      return res.status(400).json({ error: 'Se requieren idPDF e id_oficio' });
    }

    const pool = await connectDB();
    
    // Verificar que el PDF existe
    const pdfCheck = await pool.request()
      .input('idPDF', sql.Int, idPDF)
      .query('SELECT * FROM PDF WHERE idPDF = @idPDF');

    if (pdfCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }

    // Verificar que el oficio existe
    const oficioCheck = await pool.request()
      .input('id_oficio', sql.Int, id_oficio)
      .query('SELECT * FROM Oficio WHERE id_oficio = @id_oficio');

    if (oficioCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Oficio no encontrado' });
    }

    // Asociar el PDF con el oficio
    await pool.request()
      .input('idPDF', sql.Int, idPDF)
      .input('id_oficio', sql.Int, id_oficio)
      .query('UPDATE PDF SET id_oficio = @id_oficio WHERE idPDF = @idPDF');

    res.status(200).json({ message: 'PDF asociado al oficio correctamente' });
  } catch (error) {
    console.error('Error al asociar PDF con oficio:', error);
    res.status(500).json({ error: error.message });
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