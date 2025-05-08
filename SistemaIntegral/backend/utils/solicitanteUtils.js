// File: solicitanteUtils.js
// SistemaIntegral/backend/utils/solicitanteUtils.js
// Este archivo contiene funciones para interactuar con la base de datos
// relacionadas con la tabla "Solicitante".

const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear solicitante
const createSolicitante = (solicitante) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Solicitante (nombre_solicitante) VALUES (?)`;
    pool.query(query, [solicitante.nombre_solicitante], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener todos los solicitantes
const getAllSolicitantes = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Solicitante ORDER BY nombre_solicitante`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener solicitante por ID
const getSolicitanteById = (idSolicitante) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Solicitante WHERE id_solicitante = ?`;
    pool.query(query, [idSolicitante], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar solicitante
const updateSolicitante = (idSolicitante, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Solicitante SET nombre_solicitante = ? WHERE id_solicitante = ?`;
    pool.query(query, [data.nombre_solicitante, idSolicitante], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Eliminar solicitante
const deleteSolicitante = (idSolicitante) => {
  return new Promise((resolve, reject) => {
    // Verificar primero si el solicitante está en uso en algún oficio
    const checkQuery = `SELECT COUNT(*) as count FROM Oficio WHERE id_solicitante = ?`;
    pool.query(checkQuery, [idSolicitante], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (results[0].count > 0) {
        reject(new Error('No se puede eliminar el solicitante porque está siendo utilizado en oficios'));
        return;
      }
      
      // Si no está en uso, proceder con la eliminación
      const deleteQuery = `DELETE FROM Solicitante WHERE id_solicitante = ?`;
      pool.query(deleteQuery, [idSolicitante], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });
};

// Buscar solicitantes por nombre
const searchSolicitantes = (searchTerm) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Solicitante WHERE nombre_solicitante LIKE ? ORDER BY nombre_solicitante`;
    pool.query(query, [`%${searchTerm}%`], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createSolicitante,
  getAllSolicitantes,
  getSolicitanteById,
  updateSolicitante,
  deleteSolicitante,
  searchSolicitantes
};