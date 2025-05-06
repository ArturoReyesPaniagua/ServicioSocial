// File: areaSchema.js
// SistemaIntegral/backend/schemas/areaSchema.js
// Este archivo define el esquema de la tabla "Area" en la base de datos

const areaSchema = `
  CREATE TABLE IF NOT EXISTS Area (
    id_area INT PRIMARY KEY AUTO_INCREMENT,
    nombre_area VARCHAR(255) NOT NULL
  )
`;

module.exports = areaSchema;