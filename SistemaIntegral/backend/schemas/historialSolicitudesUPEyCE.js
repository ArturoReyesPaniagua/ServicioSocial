 // SistemaIntegral/backend/schemas/notificacionesHistorialSchema.js
const notificacionesHistorialSchema = `
 
 -- Tabla de Historial de Solicitudes UPEyCE
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistorialSolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[HistorialSolicitudUPEyCE] (
      id_historial INT IDENTITY(1,1) PRIMARY KEY,
      id_solicitud INT NOT NULL,
      estado_anterior NVARCHAR(20),
      estado_nuevo NVARCHAR(20) NOT NULL,
      id_usuario_cambio INT NOT NULL,
      comentarios NVARCHAR(500),
      fecha_cambio DATETIME DEFAULT GETDATE(),
      
      CONSTRAINT FK_HistorialSolicitud_Solicitud FOREIGN KEY (id_solicitud) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE CASCADE,
      CONSTRAINT FK_HistorialSolicitud_Usuario FOREIGN KEY (id_usuario_cambio) REFERENCES users(userId) ON DELETE CASCADE
    );
  END
  `;

module.exports = notificacionesSchema;