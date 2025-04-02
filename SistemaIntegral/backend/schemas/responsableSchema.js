// responsableSchema.js
const responsableSchema = `
  CREATE TABLE IF NOT EXISTS Responsable (
    id_responsable INT PRIMARY KEY,
    Nombre_responsable VARCHAR(255)
  )
`;
module.exports = responsableSchema;