const pdfSchema = `
  CREATE TABLE IF NOT EXISTS PDF (
    idPDF INT AUTO_INCREMENT PRIMARY KEY,
    nombreArchivo VARCHAR(255),
    archivo LONGBLOB NOT NULL,
    idExpediente INT,
    fechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idExpediente) REFERENCES Expediente(idExpediente) ON DELETE CASCADE
  );
`;

module.exports = pdfSchema;