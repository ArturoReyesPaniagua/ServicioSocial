// pdfSchema.js
const pdfSchema = `
  CREATE TABLE IF NOT EXISTS PDF (
    id_archivo INT PRIMARY KEY,
    archivo BLOB,
    id_oficio INT,
    FOREIGN KEY (id_oficio) REFERENCES Oficio(id_oficio)
  )
`;
module.exports = pdfSchema;