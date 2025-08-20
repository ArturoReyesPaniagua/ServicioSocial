// SistemaIntegral/backend/schemas/solicitudUPEyCESchema.js
// Esquema actualizado SIN views, solo tablas base

const solicitudUPEyCESchema = `
  -- Crear tabla SolicitudUPEyCE si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[SolicitudUPEyCE] (
      id_solicitud INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Área que solicita el UPEyCE
      id_area INT NOT NULL,
      
      -- Usuario que hace la solicitud
      id_usuario_solicita INT NOT NULL,
      
      -- Detalles de la solicitud
      justificacion NVARCHAR(1000) NOT NULL,
      descripcion NVARCHAR(500) NULL,
      prioridad NVARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('normal', 'urgente')),
      
      -- Estado de la solicitud
      estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
      
      -- Fechas
      fecha_solicitud DATETIME DEFAULT GETDATE(),
      fecha_respuesta DATETIME NULL,
      
      -- Respuesta del administrador
      id_usuario_responde INT NULL,
      comentarios_respuesta NVARCHAR(500) NULL,
      numero_UPEyCE_asignado NVARCHAR(50) NULL,
      
      -- Foreign Keys
      CONSTRAINT FK_SolicitudUPEyCE_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_SolicitudUPEyCE_Usuario_Solicita FOREIGN KEY (id_usuario_solicita) REFERENCES users(userId),
      CONSTRAINT FK_SolicitudUPEyCE_Usuario_Responde FOREIGN KEY (id_usuario_responde) REFERENCES users(userId)
    );
    
    -- Índices para optimización
    CREATE INDEX IX_SolicitudUPEyCE_Estado ON SolicitudUPEyCE(estado);
    CREATE INDEX IX_SolicitudUPEyCE_Area ON SolicitudUPEyCE(id_area);
    CREATE INDEX IX_SolicitudUPEyCE_Usuario ON SolicitudUPEyCE(id_usuario_solicita);
    CREATE INDEX IX_SolicitudUPEyCE_Fecha ON SolicitudUPEyCE(fecha_solicitud);
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

  -- Crear tabla Notificaciones si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[Notificaciones] (
      id_notificacion INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Usuario destinatario
      id_usuario INT NOT NULL,
      
      -- Detalles de la notificación
      tipo NVARCHAR(50) NOT NULL CHECK (tipo IN ('nueva_solicitud', 'solicitud_aprobada', 'solicitud_rechazada', 'solicitud_cancelada', 'sistema')),
      titulo NVARCHAR(100) NOT NULL,
      mensaje NVARCHAR(500) NOT NULL,
      
      -- Estado de la notificación
      leida BIT DEFAULT 0,
      fecha_creacion DATETIME DEFAULT GETDATE(),
      fecha_lectura DATETIME NULL,
      
      -- Referencia opcional a solicitud
      id_solicitud_referencia INT NULL,
      
      -- Foreign Keys
      CONSTRAINT FK_Notificaciones_Usuario FOREIGN KEY (id_usuario) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_Notificaciones_Solicitud FOREIGN KEY (id_solicitud_referencia) REFERENCES SolicitudUPEyCE(id_solicitud) ON DELETE SET NULL
    );
    
    -- Índices para optimización
    CREATE INDEX IX_Notificaciones_Usuario ON Notificaciones(id_usuario);
    CREATE INDEX IX_Notificaciones_Leida ON Notificaciones(leida);
    CREATE INDEX IX_Notificaciones_Fecha ON Notificaciones(fecha_creacion);
  END

  PRINT 'Esquemas de solicitudes UPEyCE creados exitosamente (sin views)';
`;

module.exports = solicitudUPEyCESchema;