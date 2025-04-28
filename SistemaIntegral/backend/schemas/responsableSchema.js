// responsableSchema.js
// SistemaIntegral/backend/schemas/responsableSchema.js
// Este archivo define el esquema de la tabla "Responsable" en la base de datos 
const responsableSchema = `
  CREATE TABLE IF NOT EXISTS Responsable (
    id_responsable INT PRIMARY KEY,
    Nombre_responsable VARCHAR(255)
  )
`;
module.exports = responsableSchema;