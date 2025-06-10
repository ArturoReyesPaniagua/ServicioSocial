// SistemaIntegral/backend/controllers/responsableControllers.js

// Controlador para manejar las operaciones CRUD de responsables  

const sql = require('mssql');
const responsableSchema = require('../schemas/responsableSchema');
const { connectDB } = require('../db/db');

// Crear un nuevo responsable
const createResponsable = async (req, res) => {
  try {
    // Asegurar que la tabla exista
    const pool = await connectDB();
    await pool.request().query(responsableSchema);

    const { nombre_responsable } = req.body;
    
    if (!nombre_responsable) {
      return res.status(400).json({ error: 'El nombre del responsable es requerido' });
    }

    const result = await pool.request()
      .input('nombre_responsable', sql.NVarChar, nombre_responsable)
      .query(`
        INSERT INTO Responsable (nombre_responsable) 
        VALUES (@nombre_responsable);
        SELECT SCOPE_IDENTITY() AS id_responsable;
      `);

    res.status(201).json({
      message: 'Responsable creado exitosamente',
      id_responsable: result.recordset[0].id_responsable
    });
  } catch (error) {
    console.error('Error al crear responsable:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los responsables
const getAllResponsables = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Responsable');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener responsables:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un responsable por ID
const getResponsableById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Responsable WHERE id_responsable = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener responsable por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un responsable
const updateResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_responsable } = req.body;
    
    if (!nombre_responsable) {
      return res.status(400).json({ error: 'El nombre del responsable es requerido' });
    }

    const pool = await connectDB();
    
    // Verificar que el responsable existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Responsable WHERE id_responsable = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    // Actualizar el responsable
    await pool.request()
      .input('nombre_responsable', sql.NVarChar, nombre_responsable)
      .input('id', sql.Int, id)
      .query('UPDATE Responsable SET nombre_responsable = @nombre_responsable WHERE id_responsable = @id');

    res.status(200).json({ message: 'Responsable actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar responsable:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un responsable
const deleteResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Verificar que el responsable existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Responsable WHERE id_responsable = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    // Verificar si el responsable está siendo utilizado en oficios
    const oficioResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Oficio WHERE id_responsable = @id');

    if (oficioResult.recordset.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el responsable porque está siendo utilizado en oficios' 
      });
    }

    // Eliminar el responsable
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Responsable WHERE id_responsable = @id');

    res.status(200).json({ message: 'Responsable eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar responsable:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createResponsable,
  getAllResponsables,
  getResponsableById,
  updateResponsable,
  deleteResponsable
};