// SistemaIntegral/backend/schemas/SolicitudUPEyCE.js
// Schema actualizado - Las solicitudes ya no incluyen un número específico

const solicitudUPEyCESchema = `
  -- Crear tabla SolicitudUPEyCE si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[SolicitudUPEyCE] (
      id_solicitud INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Información de la solicitud
      justificacion NVARCHAR(1000) NOT NULL,
      descripcion NVARCHAR(500),
      prioridad NVARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('normal', 'urgente')),
      
      -- Usuario y área que solicita
      id_area INT NOT NULL,
      id_usuario_solicita INT NOT NULL,
      fecha_solicitud DATETIME DEFAULT GETDATE(),
      
      -- Información de respuesta del administrador
      estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
      id_usuario_responde INT,
      fecha_respuesta DATETIME,
      comentarios_respuesta NVARCHAR(500),
      
      -- UPEyCE generado (solo cuando se aprueba)
      id_UPEyCE_generado INT,
      numero_UPEyCE_asignado NVARCHAR(50), -- Para almacenar el número asignado
      
      -- Foreign Keys
      CONSTRAINT FK_SolicitudUPEyCE_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioSolicita FOREIGN KEY (id_usuario_solicita) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioResponde FOREIGN KEY (id_usuario_responde) REFERENCES users(userId) ON DELETE SET NULL,
      CONSTRAINT FK_SolicitudUPEyCE_UPEyCE FOREIGN KEY (id_UPEyCE_generado) REFERENCES UPEyCE(id_UPEyCE) ON DELETE SET NULL
    );
    
    -- Índices para mejorar rendimiento
    CREATE INDEX IX_SolicitudUPEyCE_Estado ON SolicitudUPEyCE(estado);
    CREATE INDEX IX_SolicitudUPEyCE_Area ON SolicitudUPEyCE(id_area);
    CREATE INDEX IX_SolicitudUPEyCE_FechaSolicitud ON SolicitudUPEyCE(fecha_solicitud);
  END

  -- Si la tabla ya existe, agregar las nuevas columnas si no existen
  IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    -- Agregar columna numero_UPEyCE_asignado si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND name = 'numero_UPEyCE_asignado')
    BEGIN
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD numero_UPEyCE_asignado NVARCHAR(50);
    END

    -- Agregar columnas de respuesta si no existen
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND name = 'estado')
    BEGIN
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado'));
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND name = 'id_usuario_responde')
    BEGIN
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD id_usuario_responde INT;
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD CONSTRAINT FK_SolicitudUPEyCE_UsuarioResponde FOREIGN KEY (id_usuario_responde) REFERENCES users(userId) ON DELETE SET NULL;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND name = 'fecha_respuesta')
    BEGIN
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD fecha_respuesta DATETIME;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND name = 'comentarios_respuesta')
    BEGIN
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD comentarios_respuesta NVARCHAR(500);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND name = 'id_UPEyCE_generado')
    BEGIN
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD id_UPEyCE_generado INT;
      ALTER TABLE [dbo].[SolicitudUPEyCE] ADD CONSTRAINT FK_SolicitudUPEyCE_UPEyCE FOREIGN KEY (id_UPEyCE_generado) REFERENCES UPEyCE(id_UPEyCE) ON DELETE SET NULL;
    END
  END

  -- Crear vista para solicitudes pendientes con información adicional
  IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_SolicitudesPendientes')
    DROP VIEW VW_SolicitudesPendientes;

  CREATE VIEW VW_SolicitudesPendientes AS
  SELECT 
    s.id_solicitud,
    s.justificacion,
    s.descripcion,
    s.prioridad,
    s.fecha_solicitud,
    s.id_area,
    a.nombre_area,
    s.id_usuario_solicita,
    u.username as usuario_solicitante,
    DATEDIFF(day, s.fecha_solicitud, GETDATE()) as dias_pendiente
  FROM SolicitudUPEyCE s
  INNER JOIN Area a ON s.id_area = a.id_area
  INNER JOIN users u ON s.id_usuario_solicita = u.userId
  WHERE s.estado = 'pendiente';
`;

module.exports = solicitudUPEyCESchema;