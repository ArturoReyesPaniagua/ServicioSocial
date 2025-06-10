// SistemaIntegral/backend/controllers/areaControllers.js

//controlador para manejar las operaciones CRUD de áreas

const sql = require('mssql');
const areaSchema = require('../schemas/areaSchema');
const { connectDB } = require('../db/db');

// Crear una nueva área
const createArea = async (req, res) => {
  try {
    // Asegurar que la tabla exista mediante la ejecución del schema
    const pool = await connectDB();
    await pool.request().query(areaSchema);

    const { nombre_area } = req.body;
    
    if (!nombre_area) {
      return res.status(400).json({ error: 'El nombre del área es requerido' });
    }

    // Insertar nueva área
    const result = await pool.request()
      .input('nombre_area', sql.NVarChar, nombre_area)
      .query(`
        INSERT INTO Area (nombre_area) 
        VALUES (@nombre_area);
        SELECT SCOPE_IDENTITY() AS id_area;
      `);

    res.status(201).json({
      message: 'Área creada exitosamente',
      id_area: result.recordset[0].id_area
    });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las áreas
const getAllAreas = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Area');
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un área por ID
const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Area WHERE id_area = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener área por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un área
const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_area } = req.body;
    
    if (!nombre_area) {
      return res.status(400).json({ error: 'El nombre del área es requerido' });
    }

    const pool = await connectDB();
    
    // Verificar que el área existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Area WHERE id_area = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    // Actualizar el área
    await pool.request()
      .input('nombre_area', sql.NVarChar, nombre_area)
      .input('id', sql.Int, id)
      .query('UPDATE Area SET nombre_area = @nombre_area WHERE id_area = @id');

    res.status(200).json({ message: 'Área actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un área
const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Verificar que el área existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Area WHERE id_area = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    // Verificar si el área está siendo utilizada en otras tablas
    const userResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id_area = @id');

    if (userResult.recordset.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el área porque está siendo utilizada por usuarios' 
      });
    }

    // Eliminar el área
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Area WHERE id_area = @id');

    res.status(200).json({ message: 'Área eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea
};