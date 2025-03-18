const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear expediente
const createExpediente = (expediente) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Expediente SET ?`;
    pool.query(query, [expediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Leer expedientes
const getAllExpedientes = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Expediente`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Leer Estados (valores únicos)
const getAllEstados = () => {
  return new Promise((resolve, reject) => {
    // Esta consulta devolverá los valores únicos del enum Estado
    const query = `SELECT DISTINCT Estado FROM Expediente`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedienteById = (idExpediente) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Expediente WHERE idExpediente = ?`;
    pool.query(query, [idExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar expediente
const updateExpediente = (idExpediente, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Expediente SET ? WHERE idExpediente = ?`;
    pool.query(query, [data, idExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Borrar expediente
const deleteExpediente = (idExpediente) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Expediente WHERE idExpediente = ?`;
    pool.query(query, [idExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Buscar expedientes
const searchExpedientes = (searchTerm) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM Expediente
      WHERE NoExpediente LIKE ? 
      OR solicitante LIKE ? 
      OR asunto LIKE ?
      OR noFolioDeSeguimiento LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    pool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Actualizado para usar el campo Estado directo
const getExpedientesByEstado = (estado) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Expediente WHERE Estado = ?`;
    pool.query(query, [estado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedientesArchivados = (archivado) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Expediente WHERE archivado = ?`;
    pool.query(query, [archivado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente,
  searchExpedientes,
  getExpedientesByEstado,
  getExpedientesArchivados,
  getAllEstados
};