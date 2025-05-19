// SistemaIntegral/backend/utils/funtiosauth.js - versión actualizada
// Este archivo contiene funciones para interactuar con la base de datos
// relacionadas con la autenticación y gestión de usuarios

const mysql = require("mysql2");
const config = require("../db/config");  // Usar la configuración centralizada
const pool = mysql.createPool(config);   // Esto usará la config que toma los valores de .env

const createTable = (schema) => {
  return new Promise((resolve, reject) => {
    //Checa si la tabla ya existe y si no la crea 
    pool.query(schema, (err, results) => {
      if (err) {
        reject(err); // Error al crear la tabla
      } else {
        resolve(results); // Tabla creada o ya existe resolve() indica que se completo la funcion con exito
      }
    });
  });
};

const checkRecordExists = (tableName, column, value) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${tableName} WHERE ${column} = ?`;

    pool.query(query, [value], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length ? results[0] : null);
        console.log(results.length);
        console.log(value);
        console.log(results[0]);
      }
    });
  });
};

const insertRecord = (tableName, record) => {
  return new Promise((resolve, reject) => {
    // Inserta un nuevo registro en la tabla
    const query = `INSERT INTO ${tableName} SET ?`;

    pool.query(query, [record], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  createTable,
  checkRecordExists,
  insertRecord,
};