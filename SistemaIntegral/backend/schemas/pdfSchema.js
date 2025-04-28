// pdfSchema.js
// sistemaIntegral/backend/schemas/pdfSchema.js
// Este archivo define el esquema de la tabla "PDF" en la base de datos
const pdfSchema = `
  CREATE TABLE IF NOT EXISTS PDF (
    id_archivo INT PRIMARY KEY,
    archivo BLOB,
    id_oficio INT,
    FOREIGN KEY (id_oficio) REFERENCES Oficio(id_oficio)
  )
`;
module.exports = pdfSchema;