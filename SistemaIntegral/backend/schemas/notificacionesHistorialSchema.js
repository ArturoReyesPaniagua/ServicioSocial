// SistemaIntegral/backend/schemas/notificacionesHistorialSchema.js
// Schema para las tablas de notificaciones e historial del sistema de tickets

const notificacionesHistorialSchema = `
  -- Crear tabla Notificaciones si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Notificaciones] (
      id_notificacion INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Usuario que recibe la notificación
      id_usuario INT NOT NULL,
      
      -- Tipo de notificación
      tipo NVARCHAR(50) NOT NULL CHECK (tipo IN (
        'nueva_solicitud', 
        'solicitud_aprobada', 
        'solicitud_rechazada', 
        'solicitud_cancelada',
        'sistema'
      )),
      
      -- Contenido de la notificación
      titulo NVARCHAR(200) NOT NULL,
      mensaje NVARCHAR(500) NOT NULL,
      
      -- Referencia a solicitud (opcional)
      id_solicitud INT NULL,
      
      -- Estado de la notificación
      leida BIT DEFAULT 0,
      fecha_creacion DATETIME DEFAULT GETDATE(),
      fecha_lectura DATETIME NULL,
      
      -- Foreign Keys
      CONSTRAINT FK_Notificaciones_Usuario FOREIGN KEY (id_usuario) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_Notificaciones_Solicitud FOREIGN KEY (id_solicitud) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE SET NULL
    );
    
    -- Índices para mejorar rendimiento
    CREATE INDEX IX_Notificaciones_Usuario ON Notificaciones(id_usuario);
    CREATE INDEX IX_Notificaciones_Leida ON Notificaciones(leida);
    CREATE INDEX IX_Notificaciones_Fecha ON Notificaciones(fecha_creacion);
  END

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

  -- Si las tablas ya existen, agregar columnas faltantes
  IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type in (N'U'))
  BEGIN
    -- Verificar y agregar columna fecha_lectura si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND name = 'fecha_lectura')
    BEGIN
      ALTER TABLE [dbo].[Notificaciones] ADD fecha_lectura DATETIME NULL;
    END

    -- Verificar y actualizar constraint de tipo si es necesario
    IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notificaciones_Tipo')
    BEGIN
      ALTER TABLE [dbo].[Notificaciones] ADD CONSTRAINT CK_Notificaciones_Tipo 
      CHECK (tipo IN ('nueva_solicitud', 'solicitud_aprobada', 'solicitud_rechazada', 'solicitud_cancelada', 'sistema'));
    END
  END

  -- Crear vista para notificaciones no leídas por usuario
  IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_NotificacionesNoLeidas')
    DROP VIEW VW_NotificacionesNoLeidas;

  CREATE VIEW VW_NotificacionesNoLeidas AS
  SELECT 
    n.id_usuario,
    COUNT(*) as notificaciones_no_leidas,
    MAX(n.fecha_creacion) as ultima_notificacion
  FROM Notificaciones n
  WHERE n.leida = 0
  GROUP BY n.id_usuario;

  -- Crear vista para historial completo de solicitudes
  IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_HistorialCompleto')
    DROP VIEW VW_HistorialCompleto;

  CREATE VIEW VW_HistorialCompleto AS
  SELECT 
    h.id_historial,
    h.id_solicitud,
    s.justificacion,
    s.prioridad,
    a.nombre_area,
    u_solicita.username as usuario_solicita,
    h.estado_anterior,
    h.estado_nuevo,
    h.fecha_cambio,
    h.comentarios,
    u_cambio.username as usuario_cambio,
    DATEDIFF(hour, 
      LAG(h.fecha_cambio) OVER (PARTITION BY h.id_solicitud ORDER BY h.fecha_cambio),
      h.fecha_cambio
    ) as horas_en_estado_anterior
  FROM HistorialSolicitudUPEyCE h
  INNER JOIN SolicitudUPEyCE s ON h.id_solicitud = s.id_solicitud
  INNER JOIN Area a ON s.id_area = a.id_area
  INNER JOIN users u_solicita ON s.id_usuario_solicita = u_solicita.userId
  INNER JOIN users u_cambio ON h.id_usuario_cambio = u_cambio.userId;

  -- Función para limpiar notificaciones antiguas (más de 6 meses)
  IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_LimpiarNotificacionesAntiguas')
    DROP PROCEDURE SP_LimpiarNotificacionesAntiguas;

  CREATE PROCEDURE SP_LimpiarNotificacionesAntiguas
  AS
  BEGIN
    SET NOCOUNT ON;
    
    DECLARE @FechaLimite DATETIME = DATEADD(month, -6, GETDATE());
    
    DELETE FROM Notificaciones 
    WHERE fecha_creacion < @FechaLimite 
    AND leida = 1;
    
    SELECT @@ROWCOUNT as NotificacionesEliminadas;
  END;

  -- Trigger para crear notificación automática cuando cambia el estado de una solicitud
  IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_SolicitudUPEyCE_EstadoCambiado')
    DROP TRIGGER TR_SolicitudUPEyCE_EstadoCambiado;

  CREATE TRIGGER TR_SolicitudUPEyCE_EstadoCambiado
  ON SolicitudUPEyCE
  AFTER UPDATE
  AS
  BEGIN
    SET NOCOUNT ON;
    
    -- Solo ejecutar si cambió el estado
    IF UPDATE(estado)
    BEGIN
      DECLARE @id_solicitud INT,
              @estado_nuevo NVARCHAR(20),
              @id_usuario_solicita INT,
              @numero_asignado NVARCHAR(50);
      
      SELECT 
        @id_solicitud = i.id_solicitud,
        @estado_nuevo = i.estado,
        @id_usuario_solicita = i.id_usuario_solicita,
        @numero_asignado = i.numero_UPEyCE_asignado
      FROM inserted i;
      
      -- Crear notificación según el nuevo estado
      IF @estado_nuevo = 'aprobado'
      BEGIN
        INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, id_solicitud)
        VALUES (@id_usuario_solicita, 'solicitud_aprobada', 
                'Solicitud UPEyCE Aprobada', 
                'Su solicitud ha sido aprobada. Número asignado: ' + ISNULL(@numero_asignado, 'N/A'),
                @id_solicitud);
      END
      ELSE IF @estado_nuevo = 'rechazado'
      BEGIN
        INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, id_solicitud)
        VALUES (@id_usuario_solicita, 'solicitud_rechazada', 
                'Solicitud UPEyCE Rechazada', 
                'Su solicitud ha sido rechazada. Revise los comentarios del administrador.',
                @id_solicitud);
      END
      ELSE IF @estado_nuevo = 'cancelado'
      BEGIN
        INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, id_solicitud)
        VALUES (@id_usuario_solicita, 'solicitud_cancelada', 
                'Solicitud UPEyCE Cancelada', 
                'Su solicitud ha sido cancelada.',
                @id_solicitud);
      END
    END
  END;
`;

module.exports = notificacionesHistorialSchema;