const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Create 
const createPDF = (pdf) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO PDF (archivo) VALUES (?)`;
    pool.query(query, [pdf.archivo], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Read 
const getPDFById = (idPDF) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM PDF WHERE idPDF = ?`;
    pool.query(query, [idPDF], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Update 
const updatePDF = (idPDF, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE PDF SET archivo = ? WHERE idPDF = ?`;
    pool.query(query, [data.archivo, idPDF], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Delete 
const deletePDF = (idPDF) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM PDF WHERE idPDF = ?`;
    pool.query(query, [idPDF], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = {
  createPDF,
  getPDFById,
  updatePDF,
  deletePDF
};