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

  -- Crear índices para mejorar el rendimiento
  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Usuario')
  BEGIN
    CREATE INDEX IX_Notificaciones_Usuario ON Notificaciones(id_usuario);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Fecha')
  BEGIN
    CREATE INDEX IX_Notificaciones_Fecha ON Notificaciones(fecha_creacion);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Leida')
  BEGIN
    CREATE INDEX IX_Notificaciones_Leida ON Notificaciones(leida);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HistorialSolicitud_Solicitud')
  BEGIN
    CREATE INDEX IX_HistorialSolicitud_Solicitud ON HistorialSolicitudUPEyCE(id_solicitud);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HistorialSolicitud_Fecha')
  BEGIN
    CREATE INDEX IX_HistorialSolicitud_Fecha ON HistorialSolicitudUPEyCE(fecha_cambio);
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
      s.descripcion,
      s.prioridad,
      s.fecha_solicitud,
      a.nombre_area,
      u.username as usuario_solicitante,
      DATEDIFF(day, s.fecha_solicitud, GETDATE()) as dias_pendiente,
      CASE 
        WHEN s.prioridad = ''urgente'' AND DATEDIFF(day, s.fecha_solicitud, GETDATE()) > 1 THEN ''CRITICO''
        WHEN s.prioridad = ''alta'' AND DATEDIFF(day, s.fecha_solicitud, GETDATE()) > 3 THEN ''ALTO''
        WHEN s.prioridad = ''normal'' AND DATEDIFF(day, s.fecha_solicitud, GETDATE()) > 7 THEN ''MEDIO''
        WHEN s.prioridad = ''baja'' AND DATEDIFF(day, s.fecha_solicitud, GETDATE()) > 14 THEN ''BAJO''
        ELSE ''NORMAL''
      END as nivel_atencion
    FROM SolicitudUPEyCE s
    INNER JOIN Area a ON s.id_area = a.id_area
    INNER JOIN users u ON s.id_usuario_solicita = u.userId
    WHERE s.estado = ''pendiente''
    ');
  END

  -- Procedimiento almacenado para limpiar notificaciones antiguas (opcional)
  IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_LimpiarNotificacionesAntiguas')
  BEGIN
    EXEC('
    CREATE PROCEDURE SP_LimpiarNotificacionesAntiguas
      @DiasAntiguedad INT = 30
    AS
    BEGIN
      SET NOCOUNT ON;
      
      DELETE FROM Notificaciones 
      WHERE leida = 1 
      AND fecha_creacion < DATEADD(day, -@DiasAntiguedad, GETDATE());
      
      SELECT @@ROWCOUNT as NotificacionesEliminadas;
    END
    ');
  END

  -- Función para obtener conteo de notificaciones no leídas
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'FN_ConteoNotificacionesNoLeidas' AND type = 'FN')
  BEGIN
    EXEC('
    CREATE FUNCTION FN_ConteoNotificacionesNoLeidas(@UserId INT)
    RETURNS INT
    AS
    BEGIN
      DECLARE @Count INT;
      
      SELECT @Count = COUNT(*)
      FROM Notificaciones
      WHERE id_usuario = @UserId AND leida = 0;
      
      RETURN ISNULL(@Count, 0);
    END
    ');
  END
`;

module.exports = notificacionesHistorialSchema;