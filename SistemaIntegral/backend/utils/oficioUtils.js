// File: oficioUtils.js
// SistemaIntegral/backend/utils/oficioUtils.js
// Este archivo contiene las funciones para interactuar con la base de datos
// relacionadas con la tabla "Oficio".

const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear oficio
const createOficio = (oficio) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Oficio SET ?`;
    pool.query(query, [oficio], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Leer oficios
const getAllOficios = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
    `;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener un oficio por ID
const getOficioById = (idOficio) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.id_oficio = ?
    `;
    pool.query(query, [idOficio], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar oficio
const updateOficio = (idOficio, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Oficio SET ? WHERE id_oficio = ?`;
    pool.query(query, [data, idOficio], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Borrar oficio
const deleteOficio = (idOficio) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Oficio WHERE id_oficio = ?`;
    pool.query(query, [idOficio], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Buscar oficios
const searchOficios = (searchTerm) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.numero_de_oficio LIKE ? OR
        o.asunto LIKE ? OR
        s.nombre_solicitante LIKE ? OR
        r.nombre_responsable LIKE ? OR
        a.nombre_area LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    pool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener oficios por estado
const getOficiosByEstado = (estado) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.estado = ?
    `;
    pool.query(query, [estado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Obtener oficios archivados
const getOficiosArchivados = (archivado) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.archivado = ?
    `;
    pool.query(query, [archivado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createOficio,
  getAllOficios,
  getOficioById,
  updateOficio,
  deleteOficio,
  searchOficios,
  getOficiosByEstado,
  getOficiosArchivados
};