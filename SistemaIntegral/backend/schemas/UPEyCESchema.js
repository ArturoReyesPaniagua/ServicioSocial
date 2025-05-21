// SistemaIntegral/backend/schemas/UPEyCESchema.js
const UPEyCESchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[UPEyCE] (
      id_UPEyCE INT IDENTITY(1,1) PRIMARY KEY,
      numero_UPEyCE NVARCHAR(50) NOT NULL,
      id_area INT NOT NULL,
      id_usuario INT,
      fecha_creacion DATETIME DEFAULT GETDATE(),
      descripcion NVARCHAR(500),
      CONSTRAINT FK_UPEyCE_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_UPEyCE_Usuario FOREIGN KEY (id_usuario) REFERENCES users(userId) ON DELETE SET NULL
    )
  END
`;

module.exports = UPEyCESchema;