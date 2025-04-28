// File:config.js
// SistemaIntegral/backend/db/config.js
// Configuración de la base de datos MySQL
// La parte de abajo es para SQL Server, la de arriba es para MySQL



const config = {
  host: "127.0.0.1",
  user: "root",
  password: "Polopolo123",
  database: "ssdb",

  };
  
  module.exports = config;


  /*
  const dbconfig = { 
    user: "sa",                    // aqui tienes que poner el usuario de tu base de datos en este caso puse sa de super administrador en sql server
    password: "Polopolo123",      //aqui tienes que poner la contraseña de tu base de datos
    server: "localhost",          
    port: 1433,                   //puerto por defecto de sql server tcp/ip 
    database: "ssdb",             // significa servicio social data base 
    dialect: "mssql",
    options: {
      encrypt: false, // Cambia a true si usas Azure
      trustServerCertificate: false, // Cambia a true si usas Azure
      trustedConnection: false, // Cambia a true si usas Azure
    },
module.exports = dbconfig;

  */