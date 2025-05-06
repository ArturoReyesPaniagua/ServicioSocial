
// File: solicitanteSchema.js
// SistemaIntegral/backend/schemas/solicitanteSchema.js
// Este archivo define el esquema de la tabla "Solicitante" en la base de datos

const solicitanteSchema = `
  CREATE TABLE IF NOT EXISTS Solicitante (
    id_solicitante INT PRIMARY KEY AUTO_INCREMENT,
    nombre_solicitante VARCHAR(255) NOT NULL
  )
`;

module.exports = solicitanteSchema;