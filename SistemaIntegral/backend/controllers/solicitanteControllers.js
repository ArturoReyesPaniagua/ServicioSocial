// SistemaIntegral/backend/controllers/solicitanteControllers.js

// Controlador para manejar las operaciones CRUD de solicitantes

const sql = require('mssql');
const solicitanteSchema = require('../schemas/solicitanteSchema');
const { connectDB } = require('../db/db');

// Crear un nuevo solicitante
const createSolicitante = async (req, res) => {
  try {
    // Asegurar que la tabla exista
    const pool = await connectDB();
    await pool.request().query(solicitanteSchema);

    const { nombre_solicitante } = req.body;
    
    if (!nombre_solicitante) {
      return res.status(400).json({ error: 'El nombre del solicitante es requerido' });
    }

    const result = await pool.request()
      .input('nombre_solicitante', sql.NVarChar, nombre_solicitante)
      .query(`
        INSERT INTO Solicitante (nombre_solicitante) 
        VALUES (@nombre_solicitante);
        SELECT SCOPE_IDENTITY() AS id_solicitante;
      `);

    res.status(201).json({
      message: 'Solicitante creado exitosamente',
      id_solicitante: result.recordset[0].id_solicitante
    });
  } catch (error) {
    console.error('Error al crear solicitante:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los solicitantes
const getAllSolicitantes = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Solicitante');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener solicitantes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un solicitante por ID
const getSolicitanteById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Solicitante WHERE id_solicitante = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener solicitante por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un solicitante
const updateSolicitante = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_solicitante } = req.body;
    
    if (!nombre_solicitante) {
      return res.status(400).json({ error: 'El nombre del solicitante es requerido' });
    }

    const pool = await connectDB();
    
    // Verificar que el solicitante existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Solicitante WHERE id_solicitante = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    // Actualizar el solicitante
    await pool.request()
      .input('nombre_solicitante', sql.NVarChar, nombre_solicitante)
      .input('id', sql.Int, id)
      .query('UPDATE Solicitante SET nombre_solicitante = @nombre_solicitante WHERE id_solicitante = @id');

    res.status(200).json({ message: 'Solicitante actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar solicitante:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un solicitante
const deleteSolicitante = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Verificar que el solicitante existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Solicitante WHERE id_solicitante = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    // Verificar si el solicitante está siendo utilizado en oficios
    const oficioResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Oficio WHERE id_solicitante = @id');

    if (oficioResult.recordset.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el solicitante porque está siendo utilizado en oficios' 
      });
    }

    // Eliminar el solicitante
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Solicitante WHERE id_solicitante = @id');

    res.status(200).json({ message: 'Solicitante eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar solicitante:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSolicitante,
  getAllSolicitantes,
  getSolicitanteById,
  updateSolicitante,
  deleteSolicitante
};