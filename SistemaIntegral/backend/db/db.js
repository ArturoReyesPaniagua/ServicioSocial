const mysql = require("mysql2");
const config = require("./config");

const connectDB = async () => {
  const pool = mysql.createPool(config);

  pool.getConnection((err, connection) => {
    if (err) {
      console.log({ error: err.message });
      return;
    }

    console.log("Conectado a la base de datos sql");
    connection.release();
  });
};

module.exports = connectDB;

/* 
import sql from "mssql";
import dbconfig = from "./config.js";

async function connectar() {
  try{
    await sql.connect(dbconfig);
    console.log("Conectado a la base de datos SQL Server");
  }
  catch (error) {
    console.error("Error de conexión a la base de datos:", error);
  }


connectar();  // llamar a la función para establecer la conexión inicial

*/ 