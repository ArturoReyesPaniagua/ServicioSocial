// File: solicitanteControllers.js
// SistemaIntegral/backend/controllers/solicitanteControllers.js
// Este archivo contiene las funciones para la gestión de solicitantes
// que interactúan con la base de datos y manejan las solicitudes HTTP relacionadas con los solicitantes

const solicitanteSchema = require('../schemas/solicitanteSchema');
const { createTable } = require('../utils/funtiosauth');
const mysql = require('mysql2/promise');
const config = require('../db/config');

// Obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

// Crear un nuevo solicitante
const createSolicitante = async (req, res) => {
  let connection;
  try {
    // Asegurar que la tabla exista
    await createTable(solicitanteSchema);

    const { nombre_solicitante } = req.body;
    
    if (!nombre_solicitante) {
      return res.status(400).json({ error: 'El nombre del solicitante es requerido' });
    }

    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Solicitante (nombre_solicitante) VALUES (?)',
      [nombre_solicitante]
    );

    res.status(201).json({
      message: 'Solicitante creado exitosamente',
      id_solicitante: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener todos los solicitantes
const getAllSolicitantes = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM Solicitante');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener un solicitante por ID
const getSolicitanteById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM Solicitante WHERE id_solicitante = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Actualizar un solicitante
const updateSolicitante = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nombre_solicitante } = req.body;
    
    if (!nombre_solicitante) {
      return res.status(400).json({ error: 'El nombre del solicitante es requerido' });
    }

    connection = await getConnection();
    
    // Verificar que el solicitante existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Solicitante WHERE id_solicitante = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    // Actualizar el solicitante
    await connection.execute(
      'UPDATE Solicitante SET nombre_solicitante = ? WHERE id_solicitante = ?',
      [nombre_solicitante, id]
    );

    res.status(200).json({ message: 'Solicitante actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Eliminar un solicitante
const deleteSolicitante = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    // Verificar que el solicitante existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Solicitante WHERE id_solicitante = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    // Verificar si el solicitante está siendo utilizado en oficios
    const [oficioRows] = await connection.execute(
      'SELECT * FROM Oficio WHERE id_solicitante = ?',
      [id]
    );

    if (oficioRows.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el solicitante porque está siendo utilizado en oficios' 
      });
    }

    // Eliminar el solicitante
    await connection.execute(
      'DELETE FROM Solicitante WHERE id_solicitante = ?',
      [id]
    );

    res.status(200).json({ message: 'Solicitante eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  createSolicitante,
  getAllSolicitantes,
  getSolicitanteById,
  updateSolicitante,
  deleteSolicitante
};