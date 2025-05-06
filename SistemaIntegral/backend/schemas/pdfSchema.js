
// File: pdfSchema.js
// SistemaIntegral/backend/schemas/pdfSchema.js
// Este archivo define el esquema de la tabla "PDF" en la base de datos

const pdfSchema = `
  CREATE TABLE IF NOT EXISTS PDF (
    idPDF INT PRIMARY KEY AUTO_INCREMENT,
    nombreArchivo VARCHAR(255) NOT NULL,
    archivo LONGBLOB NOT NULL,
    id_oficio INT,
    fechaSubida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_oficio) REFERENCES Oficio(id_oficio) ON DELETE SET NULL
  )
`;

module.exports = pdfSchema;