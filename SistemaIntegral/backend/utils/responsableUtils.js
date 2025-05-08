// File: responsableUtils.js
// SistemaIntegral/backend/utils/responsableUtils.js
// Este archivo contiene funciones para interactuar con la base de datos
// relacionadas con la tabla "Responsable".

const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear responsable
const createResponsable = (responsable) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Responsable (nombre_responsable) VALUES (?)`;
    pool.query(query, [responsable.nombre_responsable], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener todos los responsables
const getAllResponsables = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Responsable ORDER BY nombre_responsable`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener responsable por ID
const getResponsableById = (idResponsable) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Responsable WHERE id_responsable = ?`;
    pool.query(query, [idResponsable], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar responsable
const updateResponsable = (idResponsable, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Responsable SET nombre_responsable = ? WHERE id_responsable = ?`;
    pool.query(query, [data.nombre_responsable, idResponsable], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Eliminar responsable
const deleteResponsable = (idResponsable) => {
  return new Promise((resolve, reject) => {
    // Verificar primero si el responsable está en uso en algún oficio
    const checkQuery = `SELECT COUNT(*) as count FROM Oficio WHERE id_responsable = ?`;
    pool.query(checkQuery, [idResponsable], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (results[0].count > 0) {
        reject(new Error('No se puede eliminar el responsable porque está siendo utilizado en oficios'));
        return;
      }
      
      // Si no está en uso, proceder con la eliminación
      const deleteQuery = `DELETE FROM Responsable WHERE id_responsable = ?`;
      pool.query(deleteQuery, [idResponsable], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });
};

// Buscar responsables por nombre
const searchResponsables = (searchTerm) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Responsable WHERE nombre_responsable LIKE ? ORDER BY nombre_responsable`;
    pool.query(query, [`%${searchTerm}%`], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createResponsable,
  getAllResponsables,
  getResponsableById,
  updateResponsable,
  deleteResponsable,
  searchResponsables
};