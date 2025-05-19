// SistemaIntegral/backend/schemas/pdfSchema.js
const pdfSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PDF]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[PDF] (
      idPDF INT IDENTITY(1,1) PRIMARY KEY,
      nombreArchivo NVARCHAR(255) NOT NULL,
      archivo VARBINARY(MAX) NOT NULL,
      id_oficio INT,
      fechaSubida DATETIME DEFAULT GETDATE(),
      CONSTRAINT FK_PDF_Oficio FOREIGN KEY (id_oficio) REFERENCES Oficio(id_oficio) ON DELETE SET NULL
    )
  END
`;

module.exports = pdfSchema;