// SistemaIntegral/backend/schemas/notificacionesSchema.js
const notificacionesSchema = `
  -- Tabla para notificaciones
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Notificaciones] (
      id_notificacion INT IDENTITY(1,1) PRIMARY KEY,
      id_usuario INT NOT NULL,
      tipo NVARCHAR(50) NOT NULL,
      titulo NVARCHAR(200) NOT NULL,
      mensaje NVARCHAR(500) NOT NULL,
      leida BIT DEFAULT 0,
      fecha_creacion DATETIME DEFAULT GETDATE(),
      id_solicitud INT,
      
      CONSTRAINT FK_Notificaciones_Usuario FOREIGN KEY (id_usuario) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_Notificaciones_Solicitud FOREIGN KEY (id_solicitud) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE SET NULL
    );
  END

  -- Índices para optimizar consultas
  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Usuario')
  BEGIN
    CREATE INDEX IX_Notificaciones_Usuario ON Notificaciones(id_usuario);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Leida')
  BEGIN
    CREATE INDEX IX_Notificaciones_Leida ON Notificaciones(leida);
  END

  -- Tabla para historial de solicitudes
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistorialSolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[HistorialSolicitudUPEyCE] (
      id_historial INT IDENTITY(1,1) PRIMARY KEY,
      id_solicitud INT NOT NULL,
      estado_anterior NVARCHAR(20),
      estado_nuevo NVARCHAR(20) NOT NULL,
      id_usuario_cambio INT NOT NULL,
      fecha_cambio DATETIME DEFAULT GETDATE(),
      comentarios NVARCHAR(500),
      
      CONSTRAINT FK_HistorialSolicitud_Solicitud FOREIGN KEY (id_solicitud) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE CASCADE,
      CONSTRAINT FK_HistorialSolicitud_Usuario FOREIGN KEY (id_usuario_cambio) REFERENCES users(userId) ON DELETE CASCADE
    );
  END

  -- Índices para el historial
  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HistorialSolicitud_Solicitud')
  BEGIN
    CREATE INDEX IX_HistorialSolicitud_Solicitud ON HistorialSolicitudUPEyCE(id_solicitud);
  END

  -- Vista para solicitudes pendientes con información adicional
  IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VW_SolicitudesPendientes')
  BEGIN
    EXEC('
    CREATE VIEW VW_SolicitudesPendientes AS
    SELECT 
      s.id_solicitud,
      s.numero_UPEyCE_solicitado,
      s.justificacion,
      s.prioridad,
      s.fecha_solicitud,
      DATEDIFF(day, s.fecha_solicitud, GETDATE()) as dias_pendiente,
      a.nombre_area,
      u.username as usuario_solicitante,
      s.descripcion
    FROM SolicitudUPEyCE s
    INNER JOIN Area a ON s.id_area = a.id_area
    INNER JOIN users u ON s.id_usuario_solicita = u.userId
    WHERE s.estado = ''pendiente''
    ');
  END
`;

module.exports = notificacionesSchema;