// SistemaIntegral/backend/schemas/upcydSchema.js
const upcydSchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UPCYD]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[UPCYD] (
      id_UPCYD INT IDENTITY(1,1) PRIMARY KEY,
      numero_UPCYD NVARCHAR(50) NOT NULL,
      id_area INT,
      id_usuario INT,
      fecha_creacion DATETIME DEFAULT GETDATE(),
      CONSTRAINT FK_UPCYD_Area FOREIGN KEY (id_area) REFERENCES Area(id_area) ON DELETE SET NULL,
      CONSTRAINT FK_UPCYD_Usuario FOREIGN KEY (id_usuario) REFERENCES users(userId) ON DELETE SET NULL
    )
  END
`;

module.exports = upcydSchema;