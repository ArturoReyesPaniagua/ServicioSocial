// SistemaIntegral/backend/schemas/solicitanteSchema.js
const solicitanteSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Solicitante]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Solicitante] (
      id_solicitante INT IDENTITY(1,1) PRIMARY KEY,
      nombre_solicitante NVARCHAR(255) NOT NULL
    )
  END
`;

module.exports = solicitanteSchema;