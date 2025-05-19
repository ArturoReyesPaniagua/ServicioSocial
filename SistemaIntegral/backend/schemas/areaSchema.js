// SistemaIntegral/backend/schemas/areaSchema.js
const areaSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Area]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Area] (
      id_area INT IDENTITY(1,1) PRIMARY KEY,
      nombre_area NVARCHAR(255) NOT NULL
    )
  END
`;

module.exports = areaSchema;