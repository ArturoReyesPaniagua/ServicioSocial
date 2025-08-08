// SistemaIntegral/backend/schemas/solicitudUPEyCESchema.js (actualizado)
const solicitudUPEyCESchema = `
  -- Crear tabla SolicitudUPEyCE si no existe
  IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SolicitudUPEyCE]') AND type in (N'U'))
  BEGIN
    CREATE TABLE [dbo].[SolicitudUPEyCE] (
      id_solicitud INT IDENTITY(1,1) PRIMARY KEY,
      
      -- Información de la solicitud
      ID_UPEyCE_solicitado NVARCHAR(50) NOT NULL,
      justificacion NVARCHAR(1000) NOT NULL,
      descripcion NVARCHAR(500),
      prioridad NVARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ( 'normal', 'urgente')),
      
      -- Usuario y área que solicita
      id_area INT NOT NULL,
      id_usuario_solicita INT NOT NULL,
      fecha_solicitud DATETIME DEFAULT GETDATE()
      
      -- Foreign Keys
      CONSTRAINT FK_SolicitudUPEyCE_Area FOREIGN KEY (id_area) REFERENCES Area(id_area),
      CONSTRAINT FK_SolicitudUPEyCE_UsuarioSolicita FOREIGN KEY (id_usuario_solicita) REFERENCES users(userId) ON DELETE CASCADE,
      CONSTRAINT FK_SolicitudUPEyCE_UPEyCE FOREIGN KEY (id_UPEyCE_generado) REFERENCES UPEyCE(id_UPEyCE) ON DELETE SET NULL
    );
  END


`;

module.exports = solicitudUPEyCESchema;