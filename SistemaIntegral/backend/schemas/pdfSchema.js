const pdfSchema = `
  CREATE TABLE IF NOT EXISTS PDF (
    idPDF INT AUTO_INCREMENT PRIMARY KEY,
    archivo BLOB NOT NULL
  );
`;

module.exports = pdfSchema;