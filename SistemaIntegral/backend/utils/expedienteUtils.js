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
    const query = `
      SELECT e.*, es.nombreEstado 
      FROM Expediente e
      JOIN Estado es ON e.idEstado = es.idEstado
    `;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedienteById = (idExpediente) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, es.nombreEstado 
      FROM Expediente e
      JOIN Estado es ON e.idEstado = es.idEstado
      WHERE e.idExpediente = ?
    `;
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
      SELECT e.*, es.nombreEstado 
      FROM Expediente e
      JOIN Estado es ON e.idEstado = es.idEstado
      WHERE e.NoExpediente LIKE ? 
      OR e.solicitante LIKE ? 
      OR e.asunto LIKE ?
      OR e.noFolioDeSeguimiento LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    pool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedientesByEstado = (idEstado) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, es.nombreEstado 
      FROM Expediente e
      JOIN Estado es ON e.idEstado = es.idEstado
      WHERE e.idEstado = ?
    `;
    pool.query(query, [idEstado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedientesArchivados = (archivado) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, es.nombreEstado 
      FROM Expediente e
      JOIN Estado es ON e.idEstado = es.idEstado
      WHERE e.archivado = ?
    `;
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
  getExpedientesArchivados
};