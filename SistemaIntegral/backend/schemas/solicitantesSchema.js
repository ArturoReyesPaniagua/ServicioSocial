// solicitanteSchema.js
// SistemaIntegral/backend/schemas/solicitanteSchema.js
// Este archivo define el esquema de la tabla "Solicitante" en la base de datos
const solicitanteSchema = `
  CREATE TABLE IF NOT EXISTS Solicitante (
    id_solicitante INT PRIMARY KEY,
    Nombre_solicitante VARCHAR(255)
  )
`;
module.exports = solicitanteSchema;
