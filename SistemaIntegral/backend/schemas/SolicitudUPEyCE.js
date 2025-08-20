// SistemaIntegral/backend/schemas/SolicitudUPEyCE.js
const solicitudUPEyCESchema = `
  -- Crear tabla SolicitudUPEyCE si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[SolicitudUPEyCE] (
      id_solicitud INT IDENTITY(1,1) PRIMARY KEY,
      justificacion NVARCHAR(1000) NOT NULL,
      descripcion NVARCHAR(500),
      prioridad NVARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('normal', 'urgente')),
      id_area INT NOT NULL,
      id_usuario_solicita INT NOT NULL,
      fecha_solicitud DATETIME DEFAULT GETDATE(),
      estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
      id_usuario_responde INT,
      fecha_respuesta DATETIME,
      comentarios_respuesta NVARCHAR(500),
      id_UPEyCE_generado INT,
      numero_UPEyCE_asignado NVARCHAR(50),

      CONSTRAINT FK_SolicitudUPEyCE_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioSolicita FOREIGN KEY (id_usuario_solicita) REFERENCES users(userId),
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioResponde FOREIGN KEY (id_usuario_responde) REFERENCES users(userId),
      CONSTRAINT FK_SolicitudUPEyCE_UPEyCE FOREIGN KEY (id_UPEyCE_generado) REFERENCES UPEyCE(id_UPEyCE)
    );

    CREATE INDEX IX_SolicitudUPEyCE_Estado ON SolicitudUPEyCE(estado);
    CREATE INDEX IX_SolicitudUPEyCE_Area ON SolicitudUPEyCE(id_area);
    CREATE INDEX IX_SolicitudUPEyCE_FechaSolicitud ON SolicitudUPEyCE(fecha_solicitud);
    CREATE INDEX IX_SolicitudUPEyCE_Prioridad ON SolicitudUPEyCE(prioridad);
  END
`;

module.exports = solicitudUPEyCESchema;
