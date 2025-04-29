// File ControllerPDF.js
// SistemaIntegral/backend/controllers/ControllerPDF.js
// Este archivo contiene las funciones para interactuar con la base de datos
// relacionadas con la tabla "PDF".


const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Create 
const createPDF = (pdf) => {
  return new Promise((resolve, reject) => { 
    // Esta función inserta un nuevo registro en la tabla PDF ( es la funcion que ayuda a guardar un PDF en la base de datos)
    // y devuelve el resultado de la operación.
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
    // Esta funcion Selecciona un PDF específico por su ID y devuelve todos sus campos.
    // Esta consulta selecciona un PDF específico por su ID
    // Aqui puede haber un error, si los pdf no cargan regresar aqui ya que no grabo el id del pdf
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
    // Esta funcion actualiza un registro de la tabla pdf, permite actualziar el PDF
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
    // Esta funcion permite eliminar PDF en caso del que el usuario se alla equivocado
    // Esta consulta elimina un PDF específico por su ID
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