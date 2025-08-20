 // SistemaIntegral/backend/schemas/notificacionesHistorialSchema.js
const notificacionesHistorialSchema = `

  -- Crear tabla HistorialSolicitudUPEyCE si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistorialSolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[HistorialSolicitudUPEyCE] (
      id_historial INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Solicitud a la que pertenece el cambio
      id_solicitud INT NOT NULL,
      
      -- Estados anterior y nuevo
      estado_anterior NVARCHAR(20) NULL,
      estado_nuevo NVARCHAR(20) NOT NULL CHECK (estado_nuevo IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
      
      -- Usuario que realizó el cambio
      id_usuario_cambio INT NOT NULL,
      
      -- Fecha del cambio
      fecha_cambio DATETIME DEFAULT GETDATE(),
      
      -- Comentarios del cambio
      comentarios NVARCHAR(500) NULL,
      
      -- Foreign Keys
      CONSTRAINT FK_HistorialSolicitud_Solicitud FOREIGN KEY (id_solicitud) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE CASCADE,
      CONSTRAINT FK_HistorialSolicitud_Usuario FOREIGN KEY (id_usuario_cambio) REFERENCES users(userId) ON DELETE NO ACTION
    );
    
    -- Índices para mejorar rendimiento
    CREATE INDEX IX_HistorialSolicitud_Solicitud ON HistorialSolicitudUPEyCE(id_solicitud);
    CREATE INDEX IX_HistorialSolicitud_Fecha ON HistorialSolicitudUPEyCE(fecha_cambio);
  END
`;
module.exports = notificacionesHistorialSchema;