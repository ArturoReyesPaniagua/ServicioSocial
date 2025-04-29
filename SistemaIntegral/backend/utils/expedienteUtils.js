// FIle expedienteUtils.js
// SistemaIntegral/backend/utils/expedienteUtils.js
// Este archivo contiene las funciones para interactuar con la base de datos
// relacionadas con la tabla "Expediente".

const mysql = require("mysql2");
const config = require("../db/config");
const pool = mysql.createPool(config);

// Crear expediente
const createExpediente = (expediente) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Expediente SET ?`; //querry para insertar un nuevo expediente
    pool.query(query, [expediente], (err, results) => {//POOL.QUERY es una función de la librería mysql2 que ejecuta una consulta SQL en la base de datos
      // y devuelve los resultados a través de un callback.
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Leer expedientes
const getAllExpedientes = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Expediente`; // selecciona todos los expedientes
    // Puedes agregar un WHERE para filtrar por archivado o estado si es necesario aunque no sea necesario
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
    // Esto es para el filtro de los expedientes por estado dentro de la pagina principal 
    const query = `SELECT DISTINCT Estado FROM Expediente`;
    pool.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedienteById = (idExpediente) => {
  return new Promise((resolve, reject) => {
    // Esta consulta selecciona un expediente específico por su ID  
    // y devuelve todos sus campos.
    const query = `SELECT * FROM Expediente WHERE idExpediente = ?`;
    pool.query(query, [idExpediente], (err, results) => { //POOL.QUERY es una función de la librería mysql2 que ejecuta una consulta SQL en la base de datos
      // y devuelve los resultados a través de un callback.
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

// Actualizar expediente
const updateExpediente = (idExpediente, data) => {
  return new Promise((resolve, reject) => {
    // Esta consulta actualiza un expediente específico por su ID
    // y establece los nuevos valores para los campos especificados.
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
    //Elimina un expediente específico por su ID
    //No hay vuelta atrás, así que asegúrate de que esto es lo que quieres hacer.
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
    // Esta consulta busca expedientes que contengan el término de búsqueda en cualquiera de los campos especificados.
    // Recordar que busca solo No.Expediente, solicitante, asunto y noFolioDeSeguimiento
    // Puedes agregar más campos si es necesario.
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
    // Esta consulta selecciona todos los expedientes que tienen un estado específico.
    // Puedes cambiar el nombre del campo "Estado" si es necesario.
    const query = `SELECT * FROM Expediente WHERE Estado = ?`;
    pool.query(query, [estado], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const getExpedientesArchivados = (archivado) => {
  return new Promise((resolve, reject) => {
    // Esta consulta selecciona todos los expedientes que están archivados o no archivados.
    // El valor de archivado debe ser un booleano (true o false).
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