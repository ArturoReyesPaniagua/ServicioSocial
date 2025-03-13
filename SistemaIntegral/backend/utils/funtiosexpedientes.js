const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Create operations
const createExpedienteMaestro = (expediente) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO expedientes_maestro (noDeExpediente) VALUES (?)`;
    pool.query(query, [expediente.noDeExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const createExpedienteDetalle = (expediente) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO expediente SET ?`;
    pool.query(query, [expediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Read operations
const getAllExpedientes = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, em.noDeExpediente 
      FROM expediente e
      JOIN expedientes_maestro em ON e.idExpediente = em.idExpediente
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
      SELECT e.*, em.noDeExpediente 
      FROM expediente e
      JOIN expedientes_maestro em ON e.idExpediente = em.idExpediente
      WHERE e.idExpediente = ?
    `;
    pool.query(query, [idExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Update operations
const updateExpedienteMaestro = (idExpediente, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE expedientes_maestro SET ? WHERE idExpediente = ?`;
    pool.query(query, [data, idExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const updateExpedienteDetalle = (idDia, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE expediente SET ? WHERE idDia = ?`;
    pool.query(query, [data, idDia], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Delete operations
const deleteExpediente = (idExpediente) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM expedientes_maestro WHERE idExpediente = ?`;
    pool.query(query, [idExpediente], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Additional useful queries
const searchExpedientes = (searchTerm) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, em.noDeExpediente 
      FROM expediente e
      JOIN expedientes_maestro em ON e.idExpediente = em.idExpediente
      WHERE em.noDeExpediente LIKE ? 
      OR e.solicitante LIKE ? 
      OR e.asunto LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    pool.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedientesByStatus = (status) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, em.noDeExpediente 
      FROM expediente e
      JOIN expedientes_maestro em ON e.idExpediente = em.idExpediente
      WHERE e.status = ?
    `;
    pool.query(query, [status], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createExpedienteMaestro,
  createExpedienteDetalle,
  getAllExpedientes,
  getExpedienteById,
  updateExpedienteMaestro,
  updateExpedienteDetalle,
  deleteExpediente,
  searchExpedientes,
  getExpedientesByStatus
};