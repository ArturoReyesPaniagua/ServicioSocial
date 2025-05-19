// SistemaIntegral/backend/schemas/responsableSchema.js
const responsableSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Responsable]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Responsable] (
      id_responsable INT IDENTITY(1,1) PRIMARY KEY,
      nombre_responsable NVARCHAR(255) NOT NULL
    )
  END
`;

module.exports = responsableSchema;