// File: areaControllers.js
// SistemaIntegral/backend/controllers/areaControllers.js
// Este archivo contiene las funciones para la gestión de áreas
// que interactúan con la base de datos y manejan las solicitudes HTTP relacionadas con las áreas

const areaSchema = require('../schemas/areaSchema');
const { createTable } = require('../utils/funtiosauth');
const mysql = require('mysql2/promise');
const config = require('../db/config');

// Obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

// Crear una nueva área
const createArea = async (req, res) => {
  let connection;
  try {
    // Asegurar que la tabla exista
    await createTable(areaSchema);

    const { nombre_area } = req.body;
    
    if (!nombre_area) {
      return res.status(400).json({ error: 'El nombre del área es requerido' });
    }

    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Area (nombre_area) VALUES (?)',
      [nombre_area]
    );

    res.status(201).json({
      message: 'Área creada exitosamente',
      id_area: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener todas las áreas
const getAllAreas = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM Area');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener un área por ID
const getAreaById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM Area WHERE id_area = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Actualizar un área
const updateArea = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nombre_area } = req.body;
    
    if (!nombre_area) {
      return res.status(400).json({ error: 'El nombre del área es requerido' });
    }

    connection = await getConnection();
    
    // Verificar que el área existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Area WHERE id_area = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    // Actualizar el área
    await connection.execute(
      'UPDATE Area SET nombre_area = ? WHERE id_area = ?',
      [nombre_area, id]
    );

    res.status(200).json({ message: 'Área actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Eliminar un área
const deleteArea = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    // Verificar que el área existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Area WHERE id_area = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    // Verificar si el área está siendo utilizada en otras tablas
    const [userRows] = await connection.execute(
      'SELECT * FROM Usuarios WHERE id_area = ?',
      [id]
    );

    if (userRows.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el área porque está siendo utilizada por usuarios' 
      });
    }

    // Eliminar el área
    await connection.execute(
      'DELETE FROM Area WHERE id_area = ?',
      [id]
    );

    res.status(200).json({ message: 'Área eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea
};