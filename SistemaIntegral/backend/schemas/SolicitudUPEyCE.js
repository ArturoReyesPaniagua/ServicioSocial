// SistemaIntegral/backend/schemas/solicitudUPEyCESchema.js
const solicitudUPEyCESchema = `
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[SolicitudUPEyCE] (
      id_solicitud INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Información de la solicitud
      numero_UPEyCE_solicitado NVARCHAR(50) NOT NULL,
      justificacion NVARCHAR(500) NOT NULL,
      prioridad NVARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
      
      -- Usuario y área que solicita
      id_area INT NOT NULL,
      id_usuario_solicita INT NOT NULL,
      fecha_solicitud DATETIME DEFAULT GETDATE(),
      
      -- Estado de la solicitud
      estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
      
      -- Información de respuesta (cuando admin responde)
      id_usuario_responde INT,
      fecha_respuesta DATETIME,
      comentarios_respuesta NVARCHAR(500),
      
      -- Referencia al UPEyCE generado (si se aprueba)
      id_UPEyCE_generado INT,
      
      -- Campos de auditoría
      fecha_actualizacion DATETIME DEFAULT GETDATE(),
      
      -- Foreign Keys
      CONSTRAINT FK_SolicitudUPEyCE_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioSolicita FOREIGN KEY (id_usuario_solicita) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioResponde FOREIGN KEY (id_usuario_responde) REFERENCES users(userId) ON DELETE SET NULL,
      CONSTRAINT FK_SolicitudUPEyCE_UPEyCE FOREIGN KEY (id_UPEyCE_generado) REFERENCES UPEyCE(id_UPEyCE) ON DELETE SET NULL
    );
  END

  -- Crear índices si no existen
  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SolicitudUPEyCE_Estado')
  BEGIN
    CREATE INDEX IX_SolicitudUPEyCE_Estado ON SolicitudUPEyCE(estado);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SolicitudUPEyCE_Usuario')
  BEGIN
    CREATE INDEX IX_SolicitudUPEyCE_Usuario ON SolicitudUPEyCE(id_usuario_solicita);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SolicitudUPEyCE_Area')
  BEGIN
    CREATE INDEX IX_SolicitudUPEyCE_Area ON SolicitudUPEyCE(id_area);
  END

  IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SolicitudUPEyCE_Fecha')
  BEGIN
    CREATE INDEX IX_SolicitudUPEyCE_Fecha ON SolicitudUPEyCE(fecha_solicitud);
  END

  -- Crear trigger para actualizar timestamp si no existe
  IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_SolicitudUPEyCE_UpdateTimestamp')
  BEGIN
    EXEC('
    CREATE TRIGGER TR_SolicitudUPEyCE_UpdateTimestamp
    ON SolicitudUPEyCE
    AFTER UPDATE
    AS
    BEGIN
        UPDATE SolicitudUPEyCE 
        SET fecha_actualizacion = GETDATE()
        FROM SolicitudUPEyCE s
        INNER JOIN inserted i ON s.id_solicitud = i.id_solicitud;
    END
    ');
  END
`;

module.exports = solicitudUPEyCESchema;