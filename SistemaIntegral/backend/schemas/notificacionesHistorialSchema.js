// SistemaIntegral/backend/schemas/notificacionesHistorialSchema.js
const notificacionesHistorialSchema = `
  -- Tabla de Notificaciones
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Notificaciones] (
      id_notificacion INT IDENTITY(1,1) PRIMARY KEY,
      id_usuario INT NOT NULL,
      tipo NVARCHAR(50) NOT NULL,
      titulo NVARCHAR(200) NOT NULL,
      mensaje NVARCHAR(500) NOT NULL,
      id_solicitud INT NULL,
      leida BIT DEFAULT 0,
      fecha_creacion DATETIME DEFAULT GETDATE(),
      
      CONSTRAINT FK_Notificaciones_Usuario FOREIGN KEY (id_usuario) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_Notificaciones_Solicitud FOREIGN KEY (id_solicitud) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE SET NULL
    );
  END

  
`;

module.exports = notificacionesHistorialSchema;