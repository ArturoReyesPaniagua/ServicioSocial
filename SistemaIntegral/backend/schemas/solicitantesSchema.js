// solicitanteSchema.js
const solicitanteSchema = `
  CREATE TABLE IF NOT EXISTS Solicitante (
    id_solicitante INT PRIMARY KEY,
    Nombre_solicitante VARCHAR(255)
  )
`;
module.exports = solicitanteSchema;
