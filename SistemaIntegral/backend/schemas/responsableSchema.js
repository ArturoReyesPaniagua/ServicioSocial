// File: responsableSchema.js
// SistemaIntegral/backend/schemas/responsableSchema.js
// Este archivo define el esquema de la tabla "Responsable" en la base de datos

const responsableSchema = `
  CREATE TABLE IF NOT EXISTS Responsable (
    id_responsable INT PRIMARY KEY AUTO_INCREMENT,
    nombre_responsable VARCHAR(255) NOT NULL
  )
`;

module.exports = responsableSchema;