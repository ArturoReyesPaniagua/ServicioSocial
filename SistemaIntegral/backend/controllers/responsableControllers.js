// File: responsableControllers.js
// SistemaIntegral/backend/controllers/responsableControllers.js
// Este archivo contiene las funciones para la gestión de responsables
// que interactúan con la base de datos y manejan las solicitudes HTTP relacionadas con los responsables

const responsableSchema = require('../schemas/responsableSchema');
const { createTable } = require('../utils/funtiosauth');
const mysql = require('mysql2/promise');
const config = require('../db/config');

// Obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

// Crear un nuevo responsable
const createResponsable = async (req, res) => {
  let connection;
  try {
    // Asegurar que la tabla exista
    await createTable(responsableSchema);

    const { nombre_responsable } = req.body;
    
    if (!nombre_responsable) {
      return res.status(400).json({ error: 'El nombre del responsable es requerido' });
    }

    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Responsable (nombre_responsable) VALUES (?)',
      [nombre_responsable]
    );

    res.status(201).json({
      message: 'Responsable creado exitosamente',
      id_responsable: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener todos los responsables
const getAllResponsables = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM Responsable');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener un responsable por ID
const getResponsableById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM Responsable WHERE id_responsable = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Actualizar un responsable
const updateResponsable = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nombre_responsable } = req.body;
    
    if (!nombre_responsable) {
      return res.status(400).json({ error: 'El nombre del responsable es requerido' });
    }

    connection = await getConnection();
    
    // Verificar que el responsable existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Responsable WHERE id_responsable = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    // Actualizar el responsable
    await connection.execute(
      'UPDATE Responsable SET nombre_responsable = ? WHERE id_responsable = ?',
      [nombre_responsable, id]
    );

    res.status(200).json({ message: 'Responsable actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Eliminar un responsable
const deleteResponsable = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    // Verificar que el responsable existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Responsable WHERE id_responsable = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    // Verificar si el responsable está siendo utilizado en oficios
    const [oficioRows] = await connection.execute(
      'SELECT * FROM Oficio WHERE id_responsable = ?',
      [id]
    );

    if (oficioRows.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el responsable porque está siendo utilizado en oficios' 
      });
    }

    // Eliminar el responsable
    await connection.execute(
      'DELETE FROM Responsable WHERE id_responsable = ?',
      [id]
    );

    res.status(200).json({ message: 'Responsable eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  createResponsable,
  getAllResponsables,
  getResponsableById,
  updateResponsable,
  deleteResponsable
};