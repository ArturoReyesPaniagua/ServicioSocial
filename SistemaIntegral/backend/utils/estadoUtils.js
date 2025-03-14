const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear estado
const createEstado = (estado) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Estado (nombreEstado) VALUES (?)`;
    pool.query(query, [estado.nombreEstado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Leer Estados
const getAllEstados = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Estado`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getEstadoById = (idEstado) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Estado WHERE idEstado = ?`;
    pool.query(query, [idEstado], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar Estado
const updateEstado = (idEstado, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Estado SET ? WHERE idEstado = ?`;
    pool.query(query, [data, idEstado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Borrar estado
const deleteEstado = (idEstado) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Estado WHERE idEstado = ?`;
    pool.query(query, [idEstado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createEstado,
  getAllEstados,
  getEstadoById,
  updateEstado,
  deleteEstado
};