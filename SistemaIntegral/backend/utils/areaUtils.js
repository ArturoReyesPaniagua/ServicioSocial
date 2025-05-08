// File: areaUtils.js
// SistemaIntegral/backend/utils/areaUtils.js
// Este archivo contiene funciones para interactuar con la base de datos
// relacionadas con la tabla "Area".

const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear área
const createArea = (area) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Area (nombre_area) VALUES (?)`;
    pool.query(query, [area.nombre_area], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener todas las áreas
const getAllAreas = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Area ORDER BY nombre_area`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener área por ID
const getAreaById = (idArea) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Area WHERE id_area = ?`;
    pool.query(query, [idArea], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar área
const updateArea = (idArea, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Area SET nombre_area = ? WHERE id_area = ?`;
    pool.query(query, [data.nombre_area, idArea], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Eliminar área
const deleteArea = (idArea) => {
  return new Promise((resolve, reject) => {
    // Verificar primero si el área está en uso en oficios
    const checkOficiosQuery = `SELECT COUNT(*) as count FROM Oficio WHERE id_area = ?`;
    pool.query(checkOficiosQuery, [idArea], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (results[0].count > 0) {
        reject(new Error('No se puede eliminar el área porque está siendo utilizada en oficios'));
        return;
      }
      
      // Verificar si el área está en uso en usuarios
      const checkUsuariosQuery = `SELECT COUNT(*) as count FROM users WHERE id_area = ?`;
      pool.query(checkUsuariosQuery, [idArea], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (results[0].count > 0) {
          reject(new Error('No se puede eliminar el área porque está siendo utilizada por usuarios'));
          return;
        }
        
        // Si no está en uso, proceder con la eliminación
        const deleteQuery = `DELETE FROM Area WHERE id_area = ?`;
        pool.query(deleteQuery, [idArea], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    });
  });
};

// Buscar áreas por nombre
const searchAreas = (searchTerm) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Area WHERE nombre_area LIKE ? ORDER BY nombre_area`;
    pool.query(query, [`%${searchTerm}%`], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
  searchAreas
};